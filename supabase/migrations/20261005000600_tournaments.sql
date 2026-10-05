-- Torneos (Apertura / Clausura): cada uno tiene sus propias jornadas y partidos.
-- Los partidos y jornadas existentes se asignan a "Apertura 2026" (torneo activo).

create table public.tournaments (
  id         integer generated always as identity primary key,
  name       text not null check (char_length(btrim(name)) between 1 and 60),
  kind       text not null check (kind in ('apertura', 'clausura')),
  year       integer not null check (year between 2000 and 2100),
  is_active  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (kind, year)
);
-- Solo un torneo activo a la vez.
create unique index tournaments_one_active on public.tournaments (is_active) where is_active;

insert into public.tournaments (name, kind, year, is_active) values ('Apertura 2026', 'apertura', 2026, true);

-- Al crear un torneo se crean sus jornadas 1-30 (17 de liga + liguilla).
create function private.seed_rounds() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.rounds (tournament_id, number) select new.id, n from generate_series(1, 30) n;
  return new;
end;
$$;

-- rounds: la llave pasa a ser (torneo, número).
alter table public.rounds add column tournament_id integer references public.tournaments (id) on delete cascade;
update public.rounds set tournament_id = (select id from public.tournaments where kind = 'apertura' and year = 2026);
alter table public.rounds alter column tournament_id set not null;
alter table public.rounds drop constraint rounds_pkey;
alter table public.rounds add primary key (tournament_id, number);

create trigger seed_rounds after insert on public.tournaments
  for each row execute function private.seed_rounds();

-- matches: pertenecen a un torneo y a una de sus jornadas.
alter table public.matches add column tournament_id integer references public.tournaments (id);
update public.matches set tournament_id = (select id from public.tournaments where kind = 'apertura' and year = 2026);
alter table public.matches alter column tournament_id set not null;
alter table public.matches add foreign key (tournament_id, round) references public.rounds (tournament_id, number);
drop index public.matches_round;
create index matches_tournament_round on public.matches (tournament_id, round, kickoff_at);

-- Triggers de jornada terminada: ahora por (torneo, jornada).
drop trigger reject_finished_round_insert on public.matches;
drop trigger reject_finished_round_update on public.matches;
create or replace function private.reject_finished_round() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if exists (select 1 from public.rounds where tournament_id = new.tournament_id and number = new.round and finished) then
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

-- Permisos y RLS de tournaments: los activos leen; solo el admin crea y activa.
revoke all on public.tournaments from anon, authenticated;
grant select on public.tournaments to authenticated;
grant insert (name, kind, year) on public.tournaments to authenticated;
grant update (is_active) on public.tournaments to authenticated;
alter table public.tournaments enable row level security;
create policy tournaments_read on public.tournaments for select to authenticated
  using ((select private.is_active()));
create policy tournaments_admin_insert on public.tournaments for insert to authenticated
  with check ((select private.is_admin()));
create policy tournaments_admin_update on public.tournaments for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
