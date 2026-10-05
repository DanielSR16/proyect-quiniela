-- Cada torneo tiene 17 jornadas.
delete from public.rounds where number > 17;
alter table public.rounds drop constraint rounds_number_check;
alter table public.rounds add constraint rounds_number_check check (number between 1 and 17);
alter table public.matches drop constraint matches_round_check;
alter table public.matches add constraint matches_round_check check (round between 1 and 17);

create or replace function private.seed_rounds() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.rounds (tournament_id, number) select new.id, n from generate_series(1, 17) n;
  return new;
end;
$$;
