-- Esquema de la quiniela sobre Supabase (reemplaza al backend Express).
-- Autenticación: Supabase Auth (correo + contraseña). La seguridad vive en RLS, triggers y grants.

-- ───────────── Esquema privado para helpers (no expuesto por la Data API) ─────────────
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ───────────── Equipos válidos (lista fija de Liga MX) ─────────────
create domain public.equipo_liga as text check (value in (
  'América', 'Atlas', 'Atlético San Luis', 'Cruz Azul', 'Chivas', 'FC Juárez',
  'León', 'Mazatlán', 'Monterrey', 'Necaxa', 'Pachuca', 'Puebla',
  'Pumas', 'Querétaro', 'Santos', 'Tigres', 'Tijuana', 'Toluca'
));

-- ───────────── Tablas ─────────────
-- Un perfil por usuario de auth. El correo vive en auth.users; el rol NUNCA se lee de user_metadata.
create table public.perfiles (
  id        uuid primary key references auth.users (id) on delete cascade,
  nombre    text not null check (char_length(btrim(nombre)) between 1 and 60),
  rol       text not null default 'jugador' check (rol in ('admin', 'jugador')),
  bloqueado boolean not null default false,
  creado_en timestamptz not null default now()
);
-- El nombre es único sin importar mayúsculas.
create unique index perfiles_nombre_unico on public.perfiles (lower(nombre));

create table public.partidos (
  id                  integer generated always as identity primary key,
  jornada             integer not null check (jornada between 1 and 30),
  equipo_local        public.equipo_liga not null,
  equipo_visitante    public.equipo_liga not null,
  hora_partido        timestamptz not null,  -- también es la hora de cierre de pronósticos
  resultado_local     integer check (resultado_local between 0 and 99),
  resultado_visitante integer check (resultado_visitante between 0 and 99),
  estado              text not null default 'proximo' check (estado in ('proximo', 'en_vivo', 'finalizado')),
  creado_en           timestamptz not null default now(),
  check (equipo_local <> equipo_visitante),
  check ((resultado_local is null) = (resultado_visitante is null))
);
create index partidos_jornada on public.partidos (jornada, hora_partido);

-- Si se elimina un partido, sus pronósticos se eliminan y dejan de contar.
create table public.predicciones (
  id              integer generated always as identity primary key,
  usuario_id      uuid not null default auth.uid() references public.perfiles (id),
  partido_id      integer not null references public.partidos (id) on delete cascade,
  goles_local     integer not null check (goles_local between 0 and 20),
  goles_visitante integer not null check (goles_visitante between 0 and 20),
  puntos          integer check (puntos in (0, 3, 5)),  -- null mientras no hay resultado; lo calcula un trigger
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  unique (usuario_id, partido_id)
);
create index predicciones_partido on public.predicciones (partido_id);

-- ───────────── Helpers para las políticas ─────────────
-- SECURITY DEFINER para leer perfiles sin recursión de RLS. Viven en "private" (no expuesto por la API).
create function private.es_activo() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.perfiles where id = (select auth.uid()) and not bloqueado);
$$;

create function private.es_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.perfiles where id = (select auth.uid()) and rol = 'admin' and not bloqueado);
$$;

revoke execute on function private.es_activo(), private.es_admin() from public, anon;
grant execute on function private.es_activo(), private.es_admin() to authenticated;

-- ───────────── Triggers ─────────────
-- Al crearse un usuario en auth, crea su perfil. El rol siempre arranca como 'jugador'.
create function private.crear_perfil() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;
create trigger crear_perfil after insert on auth.users
  for each row execute function private.crear_perfil();

-- Siempre debe quedar al menos un admin activo (bloquear, degradar o borrar al último se rechaza).
create function private.proteger_ultimo_admin() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if old.rol = 'admin' and not old.bloqueado
     and (tg_op = 'DELETE' or new.rol <> 'admin' or new.bloqueado) then
    -- Bloquea las filas de los otros admins mientras se decide (evita carreras).
    perform 1 from public.perfiles where rol = 'admin' and not bloqueado and id <> old.id for update;
    if not found then
      raise exception 'Debe quedar al menos un administrador activo';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;
create trigger proteger_ultimo_admin before update or delete on public.perfiles
  for each row execute function private.proteger_ultimo_admin();

-- Con resultado el partido pasa a 'finalizado'.
create function private.estado_partido() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.resultado_local is not null then new.estado := 'finalizado'; end if;
  return new;
end;
$$;
create trigger estado_partido before insert or update on public.partidos
  for each row execute function private.estado_partido();

-- Al capturar o corregir el resultado se recalculan los puntos del partido:
-- 5 marcador exacto, 3 resultado correcto (signo de la diferencia), 0 en otro caso.
create function private.recalcular_puntos() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.predicciones p
     set puntos = case
       when new.resultado_local is null then null
       when p.goles_local = new.resultado_local and p.goles_visitante = new.resultado_visitante then 5
       when sign(p.goles_local - p.goles_visitante) = sign(new.resultado_local - new.resultado_visitante) then 3
       else 0
     end
   where p.partido_id = new.id;
  return null;
end;
$$;
create trigger recalcular_puntos after update on public.partidos
  for each row
  when (old.resultado_local is distinct from new.resultado_local
        or old.resultado_visitante is distinct from new.resultado_visitante)
  execute function private.recalcular_puntos();

create function private.tocar_prediccion() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;
create trigger tocar_prediccion before update on public.predicciones
  for each row execute function private.tocar_prediccion();

-- ───────────── Permisos de tabla (mínimos) ─────────────
revoke all on public.perfiles, public.partidos, public.predicciones from anon, authenticated;
grant select on public.perfiles to authenticated;
grant update (nombre, rol, bloqueado) on public.perfiles to authenticated;       -- solo admin (RLS)
grant select, insert, delete on public.partidos to authenticated;                -- escritura solo admin (RLS)
grant update (jornada, equipo_local, equipo_visitante, hora_partido, resultado_local, resultado_visitante, estado)
  on public.partidos to authenticated;
grant select on public.predicciones to authenticated;
grant insert (partido_id, goles_local, goles_visitante) on public.predicciones to authenticated;
grant update (partido_id, goles_local, goles_visitante) on public.predicciones to authenticated;  -- "puntos" nunca

-- ───────────── RLS ─────────────
alter table public.perfiles enable row level security;
alter table public.partidos enable row level security;
alter table public.predicciones enable row level security;

-- perfiles: los activos ven a todos (para el ranking); solo el admin edita. Un bloqueado no ve nada.
create policy perfiles_leer on public.perfiles for select to authenticated
  using ((select private.es_activo()));
create policy perfiles_admin_editar on public.perfiles for update to authenticated
  using ((select private.es_admin())) with check ((select private.es_admin()));

-- partidos: los activos los ven; solo el admin crea, edita y elimina.
create policy partidos_leer on public.partidos for select to authenticated
  using ((select private.es_activo()));
create policy partidos_admin_crear on public.partidos for insert to authenticated
  with check ((select private.es_admin()));
create policy partidos_admin_editar on public.partidos for update to authenticated
  using ((select private.es_admin())) with check ((select private.es_admin()));
create policy partidos_admin_borrar on public.partidos for delete to authenticated
  using ((select private.es_admin()));

-- predicciones: las propias siempre; las ajenas solo cuando el partido ya cerró (o si eres admin).
create policy predicciones_leer on public.predicciones for select to authenticated
  using (
    (select private.es_activo())
    and (
      usuario_id = (select auth.uid())
      or (select private.es_admin())
      or exists (select 1 from public.partidos m
                  where m.id = partido_id and (m.hora_partido <= now() or m.resultado_local is not null))
    )
  );
-- Crear/editar solo la propia y solo mientras el partido siga abierto (reloj del servidor).
create policy predicciones_crear on public.predicciones for insert to authenticated
  with check (
    (select private.es_activo())
    and usuario_id = (select auth.uid())
    and exists (select 1 from public.partidos m
                 where m.id = partido_id and m.hora_partido > now() and m.resultado_local is null)
  );
create policy predicciones_editar on public.predicciones for update to authenticated
  using (
    (select private.es_activo())
    and usuario_id = (select auth.uid())
    and exists (select 1 from public.partidos m
                 where m.id = partido_id and m.hora_partido > now() and m.resultado_local is null)
  )
  with check (
    usuario_id = (select auth.uid())
    and exists (select 1 from public.partidos m
                 where m.id = partido_id and m.hora_partido > now() and m.resultado_local is null)
  );
