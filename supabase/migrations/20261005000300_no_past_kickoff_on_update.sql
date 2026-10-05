-- Al editar un partido tampoco se puede poner una hora anterior al minuto actual.
-- Solo cuando la hora cambia: corregir equipos o jornada de un partido que ya empezó sigue permitido.
create trigger reject_past_kickoff_update before update of kickoff_at on public.matches
  for each row
  when (old.kickoff_at is distinct from new.kickoff_at)
  execute function private.reject_past_kickoff();
