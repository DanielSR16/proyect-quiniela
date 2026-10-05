-- Esquema de la quiniela para Postgres (Supabase). Ejecutar en el SQL Editor de Supabase.
-- Es idempotente: se puede correr de nuevo sin romper nada.

create table if not exists usuarios (
  id            integer generated always as identity primary key,
  nombre        text not null,
  correo        text,
  password_hash text not null,
  rol           text not null default 'jugador' check (rol in ('admin', 'jugador')),
  bloqueado     boolean not null default false,
  creado_en     timestamptz not null default now()
);
-- El nombre de usuario es único sin importar mayúsculas.
create unique index if not exists usuarios_nombre_unico on usuarios (lower(nombre));

create table if not exists partidos (
  id                  integer generated always as identity primary key,
  jornada             integer not null check (jornada between 1 and 30),
  equipo_local        text not null,
  equipo_visitante    text not null,
  hora_partido        timestamptz not null,  -- también es la hora de cierre de pronósticos
  resultado_local     integer check (resultado_local between 0 and 99),
  resultado_visitante integer check (resultado_visitante between 0 and 99),
  estado              text not null default 'proximo' check (estado in ('proximo', 'en_vivo', 'finalizado')),
  creado_en           timestamptz not null default now(),
  check (equipo_local <> equipo_visitante),
  check ((resultado_local is null) = (resultado_visitante is null))
);
create index if not exists partidos_jornada on partidos (jornada, hora_partido);

-- Si se elimina un partido, sus pronósticos se eliminan y dejan de contar.
create table if not exists predicciones (
  id              integer generated always as identity primary key,
  usuario_id      integer not null references usuarios (id),
  partido_id      integer not null references partidos (id) on delete cascade,
  goles_local     integer not null check (goles_local between 0 and 20),
  goles_visitante integer not null check (goles_visitante between 0 and 20),
  puntos          integer check (puntos in (0, 3, 5)),  -- null mientras no hay resultado
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),
  unique (usuario_id, partido_id)
);
create index if not exists predicciones_partido on predicciones (partido_id);

-- El backend se conecta directo a Postgres. Activar RLS sin políticas evita que alguien
-- lea o escriba estas tablas por la API pública de Supabase (clave anon).
alter table usuarios enable row level security;
alter table partidos enable row level security;
alter table predicciones enable row level security;
