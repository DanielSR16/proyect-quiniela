-- Recrea el esquema con nombres de tablas, columnas y valores en inglés.
-- El proyecto era nuevo (sin datos), así que se elimina y se vuelve a crear en vez de renombrar:
-- renombrar no actualiza el cuerpo de las funciones.

drop table if exists public.predictions, public.matches, public.profiles, public.predicciones, public.partidos, public.perfiles cascade;
drop domain if exists public.equipo_liga;
drop schema if exists private cascade;  -- también elimina los triggers que dependían de sus funciones

-- ───────────── Esquema privado para helpers (no expuesto por la Data API) ─────────────
create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ───────────── Equipos válidos (lista fija de Liga MX) ─────────────
create domain public.team_name as text check (value in (
  'América', 'Atlas', 'Atlético San Luis', 'Cruz Azul', 'Chivas', 'FC Juárez',
  'León', 'Mazatlán', 'Monterrey', 'Necaxa', 'Pachuca', 'Puebla',
  'Pumas', 'Querétaro', 'Santos', 'Tigres', 'Tijuana', 'Toluca'
));

-- ───────────── Tablas ─────────────
-- Un perfil por usuario de auth. El correo vive en auth.users; el rol NUNCA se lee de user_metadata.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 60),
  role       text not null default 'player' check (role in ('admin', 'player')),
  blocked    boolean not null default false,
  created_at timestamptz not null default now()
);
-- El nombre es único sin importar mayúsculas.
create unique index profiles_name_unique on public.profiles (lower(name));

create table public.matches (
  id         integer generated always as identity primary key,
  round      integer not null check (round between 1 and 30),
  home_team  public.team_name not null,
  away_team  public.team_name not null,
  kickoff_at timestamptz not null,  -- también es la hora de cierre de pronósticos
  home_score integer check (home_score between 0 and 99),
  away_score integer check (away_score between 0 and 99),
  status     text not null default 'upcoming' check (status in ('upcoming', 'live', 'finished')),
  created_at timestamptz not null default now(),
  check (home_team <> away_team),
  check ((home_score is null) = (away_score is null))
);
create index matches_round on public.matches (round, kickoff_at);

-- Si se elimina un partido, sus pronósticos se eliminan y dejan de contar.
create table public.predictions (
  id         integer generated always as identity primary key,
  user_id    uuid not null default auth.uid() references public.profiles (id),
  match_id   integer not null references public.matches (id) on delete cascade,
  home_goals integer not null check (home_goals between 0 and 20),
  away_goals integer not null check (away_goals between 0 and 20),
  points     integer check (points in (0, 3, 5)),  -- null mientras no hay resultado; lo calcula un trigger
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);
create index predictions_match on public.predictions (match_id);

-- ───────────── Helpers para las políticas ─────────────
-- SECURITY DEFINER para leer profiles sin recursión de RLS. Viven en "private" (no expuesto por la API).
create function private.is_active() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and not blocked);
$$;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin' and not blocked);
$$;

revoke execute on function private.is_active(), private.is_admin() from public, anon;
grant execute on function private.is_active(), private.is_admin() to authenticated;

-- ───────────── Triggers ─────────────
-- Al crearse un usuario en auth, crea su perfil. El rol siempre arranca como 'player'.
create function private.create_profile() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger create_profile after insert on auth.users
  for each row execute function private.create_profile();

-- Siempre debe quedar al menos un admin activo (bloquear, degradar o borrar al último se rechaza).
create function private.protect_last_admin() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.role = 'admin' and not old.blocked
     and (tg_op = 'DELETE' or new.role <> 'admin' or new.blocked) then
    -- Bloquea las filas de los otros admins mientras se decide (evita carreras).
    perform 1 from public.profiles where role = 'admin' and not blocked and id <> old.id for update;
    if not found then
      raise exception 'Debe quedar al menos un administrador activo';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;
create trigger protect_last_admin before update or delete on public.profiles
  for each row execute function private.protect_last_admin();

-- Con resultado el partido pasa a 'finished'.
create function private.set_match_status() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.home_score is not null then new.status := 'finished'; end if;
  return new;
end;
$$;
create trigger set_match_status before insert or update on public.matches
  for each row execute function private.set_match_status();

-- Al capturar o corregir el resultado se recalculan los puntos del partido:
-- 5 marcador exacto, 3 resultado correcto (signo de la diferencia), 0 en otro caso.
create function private.recalculate_points() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.predictions p
     set points = case
       when new.home_score is null then null
       when p.home_goals = new.home_score and p.away_goals = new.away_score then 5
       when sign(p.home_goals - p.away_goals) = sign(new.home_score - new.away_score) then 3
       else 0
     end
   where p.match_id = new.id;
  return null;
end;
$$;
create trigger recalculate_points after update on public.matches
  for each row
  when (old.home_score is distinct from new.home_score
        or old.away_score is distinct from new.away_score)
  execute function private.recalculate_points();

create function private.touch_prediction() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger touch_prediction before update on public.predictions
  for each row execute function private.touch_prediction();

-- ───────────── Permisos de tabla (mínimos) ─────────────
revoke all on public.profiles, public.matches, public.predictions from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (name, role, blocked) on public.profiles to authenticated;          -- solo admin (RLS)
grant select, insert, delete on public.matches to authenticated;                 -- escritura solo admin (RLS)
grant update (round, home_team, away_team, kickoff_at, home_score, away_score, status)
  on public.matches to authenticated;
grant select on public.predictions to authenticated;
grant insert (match_id, home_goals, away_goals) on public.predictions to authenticated;
grant update (match_id, home_goals, away_goals) on public.predictions to authenticated;  -- "points" nunca

-- ───────────── RLS ─────────────
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

-- profiles: los activos ven a todos (para el ranking); solo el admin edita. Un bloqueado no ve nada.
create policy profiles_read on public.profiles for select to authenticated
  using ((select private.is_active()));
create policy profiles_admin_update on public.profiles for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

-- matches: los activos los ven; solo el admin crea, edita y elimina.
create policy matches_read on public.matches for select to authenticated
  using ((select private.is_active()));
create policy matches_admin_insert on public.matches for insert to authenticated
  with check ((select private.is_admin()));
create policy matches_admin_update on public.matches for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy matches_admin_delete on public.matches for delete to authenticated
  using ((select private.is_admin()));

-- predictions: las propias siempre; las ajenas solo cuando el partido ya cerró (o si eres admin).
create policy predictions_read on public.predictions for select to authenticated
  using (
    (select private.is_active())
    and (
      user_id = (select auth.uid())
      or (select private.is_admin())
      or exists (select 1 from public.matches m
                  where m.id = match_id and (m.kickoff_at <= now() or m.home_score is not null))
    )
  );
-- Crear/editar solo la propia y solo mientras el partido siga abierto (reloj del servidor).
create policy predictions_insert on public.predictions for insert to authenticated
  with check (
    (select private.is_active())
    and user_id = (select auth.uid())
    and exists (select 1 from public.matches m
                 where m.id = match_id and m.kickoff_at > now() and m.home_score is null)
  );
create policy predictions_update on public.predictions for update to authenticated
  using (
    (select private.is_active())
    and user_id = (select auth.uid())
    and exists (select 1 from public.matches m
                 where m.id = match_id and m.kickoff_at > now() and m.home_score is null)
  )
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.matches m
                 where m.id = match_id and m.kickoff_at > now() and m.home_score is null)
  );
