-- Un partido nuevo no puede tener una hora anterior al minuto actual.
-- Solo al crear: editar un partido que ya empezó (equipos, resultado) sigue permitido.
create function private.reject_past_kickoff() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.kickoff_at < date_trunc('minute', now()) then
    raise exception 'La hora del partido no puede ser anterior a la hora actual';
  end if;
  return new;
end;
$$;
create trigger reject_past_kickoff before insert on public.matches
  for each row execute function private.reject_past_kickoff();
