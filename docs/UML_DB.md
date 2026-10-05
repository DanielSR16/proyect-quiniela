# UML de la base de datos

Diagrama entidad-relación (Mermaid) del esquema en Supabase Postgres.
`teams` ya está aplicada (migración `20261005000400_teams_table.sql`): los partidos referencian equipos por `id`, ya no por texto.

```mermaid
erDiagram
    auth_users ||--|| profiles : "tiene"
    profiles   ||--o{ predictions : "hace"
    matches    ||--o{ predictions : "recibe"
    tournaments ||--o{ rounds : "tiene (1-23)"
    tournaments ||--o{ matches : "incluye"
    rounds     ||--o{ matches : "agrupa (tournament_id, round)"
    teams      ||--o{ matches : "juega de local (home_team_id)"
    teams      ||--o{ matches : "juega de visitante (away_team_id)"

    auth_users {
        uuid id PK
        text email
    }

    profiles {
        uuid id PK, FK
        text name "unico sin importar mayusculas"
        text role "admin | player"
        boolean blocked
        timestamptz created_at
    }

    tournaments {
        integer id PK
        text name "Apertura 2026"
        text kind "apertura | clausura"
        integer year
        boolean is_active "solo uno activo"
    }

    rounds {
        integer tournament_id PK, FK
        integer number PK "1 a 17 regular, 18 a 23 liguilla"
        boolean finished "terminada: no admite partidos nuevos"
    }

    teams {
        integer id PK
        text name "unico"
        text short_name "siglas, ej. AME"
        text slug "unico, nombre del logo en /logos"
        text logo_url "opcional"
        timestamptz created_at
    }

    matches {
        integer id PK
        integer tournament_id FK
        integer round "FK compuesta a rounds"
        integer home_team_id FK
        integer away_team_id FK
        timestamptz kickoff_at "hora de cierre de pronosticos"
        integer home_score "null hasta tener resultado"
        integer away_score "null hasta tener resultado"
        text status "upcoming | live | finished"
        timestamptz created_at
    }

    predictions {
        integer id PK
        uuid user_id FK
        integer match_id FK
        integer home_goals
        integer away_goals
        integer points "null, 0, 3 o 5 (lo calcula un trigger)"
        timestamptz created_at
        timestamptz updated_at
    }
```

## Reglas del modelo

- `matches.home_team_id` y `matches.away_team_id` son FK a `teams.id`, con `check (home_team_id <> away_team_id)`.
- `teams` la modifica solo el desarrollador (RLS: lectura para usuarios activos, sin escritura desde la app). Reemplazó al dominio `team_name`; `frontend/src/lib/equipos.ts` solo conserva colores y siglas del escudo por defecto.
- `predictions` es única por `(user_id, match_id)`; si se borra el partido se borran sus pronósticos.
- Los colores y siglas del escudo por defecto pueden quedarse en el front o pasar a `teams` más adelante.
- Cada torneo (Apertura/Clausura) tiene sus propias jornadas; `rounds` se crea sola (1-23) al crear el torneo. Las posiciones se calculan por torneo.
- Una jornada con `finished = true` no admite partidos nuevos ni mover partidos hacia ella (trigger `reject_finished_round`).
- Las fechas de una jornada ("12 – 15 oct") no se guardan: se calculan con la primera y la última hora de sus partidos.
- Liguilla (8 equipos, sin Play-In): `round` 18 y 19 = Cuartos ida/vuelta, 20 y 21 = Semifinal ida/vuelta, 22 y 23 = Final ida/vuelta. Cada partido de ida y de vuelta se pronostica y puntúa por separado. Los nombres se calculan en `frontend/src/lib/jornadas.ts`.
