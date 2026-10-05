-- Los equipos pasan de un dominio de texto a una tabla; matches los referencia por id.
-- Conserva los partidos existentes (se rellenan los ids a partir del nombre).

create table public.teams (
  id         integer generated always as identity primary key,
  name       text not null check (char_length(btrim(name)) between 1 and 60),
  short_name text not null check (char_length(short_name) between 2 and 4),
  slug       text not null,  -- nombre del logo: frontend/public/logos/<slug>.png
  logo_url   text,
  created_at timestamptz not null default now(),
  unique (name),
  unique (slug)
);

insert into public.teams (name, short_name, slug) values
  ('América', 'AME', 'america'),
  ('Atlas', 'ATL', 'atlas'),
  ('Atlético San Luis', 'ASL', 'atletico-san-luis'),
  ('Cruz Azul', 'CAZ', 'cruz-azul'),
  ('Chivas', 'CHI', 'chivas'),
  ('FC Juárez', 'JUA', 'fc-juarez'),
  ('León', 'LEO', 'leon'),
  ('Mazatlán', 'MAZ', 'mazatlan'),
  ('Monterrey', 'MTY', 'monterrey'),
  ('Necaxa', 'NEC', 'necaxa'),
  ('Pachuca', 'PAC', 'pachuca'),
  ('Puebla', 'PUE', 'puebla'),
  ('Pumas', 'PUM', 'pumas'),
  ('Querétaro', 'QRO', 'queretaro'),
  ('Santos', 'SAN', 'santos'),
  ('Tigres', 'TIG', 'tigres'),
  ('Tijuana', 'TIJ', 'tijuana'),
  ('Toluca', 'TOL', 'toluca');

-- Solo lectura desde la app: los equipos los modifica el desarrollador.
revoke all on public.teams from anon, authenticated;
grant select on public.teams to authenticated;
alter table public.teams enable row level security;
create policy teams_read on public.teams for select to authenticated
  using ((select private.is_active()));

-- matches: de texto a FK.
alter table public.matches
  add column home_team_id integer references public.teams (id),
  add column away_team_id integer references public.teams (id);

update public.matches m
   set home_team_id = h.id, away_team_id = a.id
  from public.teams h, public.teams a
 where h.name = m.home_team and a.name = m.away_team;

alter table public.matches
  alter column home_team_id set not null,
  alter column away_team_id set not null,
  add check (home_team_id <> away_team_id);

alter table public.matches drop column home_team, drop column away_team;
drop domain public.team_name;

create index matches_home_team on public.matches (home_team_id);
create index matches_away_team on public.matches (away_team_id);

-- Los permisos por columna se pierden con las columnas eliminadas: se otorgan los nuevos.
grant update (home_team_id, away_team_id) on public.matches to authenticated;
