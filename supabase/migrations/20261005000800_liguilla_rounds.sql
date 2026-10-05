-- Liguilla: 17 jornadas de fase regular + 6 rondas de ida y vuelta.
-- 18 Cuartos ida, 19 Cuartos vuelta, 20 Semifinal ida, 21 Semifinal vuelta, 22 Final ida, 23 Final vuelta.
alter table public.rounds drop constraint rounds_number_check;
alter table public.rounds add constraint rounds_number_check check (number between 1 and 23);
alter table public.matches drop constraint matches_round_check;
alter table public.matches add constraint matches_round_check check (round between 1 and 23);

insert into public.rounds (tournament_id, number)
select t.id, n from public.tournaments t, generate_series(18, 23) n
on conflict do nothing;

create or replace function private.seed_rounds() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.rounds (tournament_id, number) select new.id, n from generate_series(1, 23) n;
  return new;
end;
$$;
