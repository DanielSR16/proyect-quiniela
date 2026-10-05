-- Control de jornadas: el admin marca una jornada como terminada y ya no se pueden agregar
-- partidos a ella hasta que la active de nuevo.
create table public.rounds (
  number   integer primary key check (number between 1 and 30),
  finished boolean not null default false
);
insert into public.rounds (number) select generate_series(1, 30);

revoke all on public.rounds from anon, authenticated;
grant select on public.rounds to authenticated;
grant update (finished) on public.rounds to authenticated;  -- solo admin (RLS)
alter table public.rounds enable row level security;
create policy rounds_read on public.rounds for select to authenticated
  using ((select private.is_active()));
create policy rounds_admin_update on public.rounds for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- No se puede crear un partido en una jornada terminada ni mover uno hacia ella.
-- Editar un partido que ya está en una jornada terminada (sin cambiarle la jornada) sigue permitido.
create function private.reject_finished_round() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if exists (select 1 from public.rounds where number = new.round and finished) then
    raise exception 'La jornada % está terminada; actívala para agregar partidos', new.round;
  end if;
  return new;
end;
$$;
create trigger reject_finished_round_insert before insert on public.matches
  for each row execute function private.reject_finished_round();
create trigger reject_finished_round_update before update of round on public.matches
  for each row
  when (old.round is distinct from new.round)
  execute function private.reject_finished_round();
