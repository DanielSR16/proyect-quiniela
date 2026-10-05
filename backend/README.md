# Backend de la quiniela

Express 5 + TypeScript sobre Postgres (Supabase). Las reglas de negocio están en `../LOGICA_NEGOCIO.md`.

## Puesta en marcha

1. En Supabase abre **SQL Editor** y ejecuta `db/schema.sql` (se puede correr más de una vez).
2. Copia `.env.example` a `.env` y llena `DATABASE_URL` (Project Settings > Database) y `JWT_SECRET`.
3. Crea el primer administrador: `npm run crear-admin -w backend -- <nombre> <contraseña>`
4. Arranca la API: `npm run dev -w backend` (por defecto en http://localhost:4000).

## Endpoints (`/api`)

Todos piden sesión (cookie httpOnly) salvo `login` y `salud`.

| Método | Ruta | Uso |
|---|---|---|
| POST | `/auth/login` · `/auth/logout` | Entrar / salir |
| GET | `/auth/me` | Usuario de la sesión |
| GET | `/partidos?jornada=` | Partidos con mi pronóstico |
| PUT | `/partidos/:id/prediccion` | Guardar pronóstico `{local, visitante}` (el servidor valida el cierre) |
| GET | `/partidos/:id/predicciones` | Pronósticos de todos (solo si el partido ya cerró) |
| GET | `/historial` | Mis partidos con resultado y puntos |
| GET | `/ranking?jornada=` | Ranking global o de una jornada |
| GET | `/ranking/jugadores/:id?jornada=` | Detalle de un jugador en una jornada |
| POST/PUT/DELETE | `/admin/partidos[/:id]` | Crear, editar, eliminar partidos |
| PUT | `/admin/partidos/:id/resultado` | Capturar o corregir el resultado (recalcula puntos) |
| PUT | `/admin/partidos/:id/estado` | `proximo` / `en_vivo` |
| GET/POST/PUT | `/admin/usuarios[/:id]` | Listar, crear, editar usuarios |
| PATCH | `/admin/usuarios/:id/bloqueo` | Bloquear / desbloquear `{bloqueado}` |

`horaPartido` se envía en ISO con zona horaria (`new Date(valor).toISOString()`).

## Pendiente

- Conectar el frontend (hoy usa datos de prueba) y mandar las cookies con `credentials: "include"`.
- Decidir si un usuario bloqueado sale del ranking (hoy sigue apareciendo).
- Si el frontend y la API quedan en dominios distintos en producción, revisar `SameSite` de la cookie.
