# Lógica de negocio (referencia para el backend)

Complementa a `PROJECT.md` (visión general, modelos de datos, stack). Este archivo reúne las **reglas que el backend debe hacer cumplir** y los puntos donde el frontend actual (mock, sin backend) difiere o añade cosas. Cuando el usuario explique una regla nueva, se agrega aquí.

Última actualización: 4 de octubre de 2026.

## 1. Reglas confirmadas

### Predicciones
- Cada usuario predice el **marcador exacto** (goles local y visitante, enteros 0–20) de cada partido.
- Se puede crear y **editar la predicción las veces que quiera hasta la `horaPartido`**. A partir de esa hora no se puede crear ni modificar.
- El cierre lo valida el **servidor** con su propia hora. El frontend solo deshabilita los botones (revisa cada 15 s) y no es seguridad.
- Un usuario tiene como máximo una predicción por partido (guardar de nuevo la reemplaza).
- Partidos sin predicción del usuario: 0 puntos, se muestran como "Sin pronóstico".

### Puntuación
| Caso | Puntos |
|---|---|
| Marcador exacto | 5 |
| Resultado correcto (gana local, gana visitante o empate) con marcador distinto | 3 |
| Resultado incorrecto | 0 |

- Implementación de referencia: `calcularPuntos` en `frontend/src/lib/mock-data.ts` (compara el signo de `local - visitante`). Un empate predicho con otro marcador de empate (ej. 1-1 vs 0-0) da 3 puntos.
- Los puntos se calculan cuando el admin captura el resultado final. Si el admin corrige un resultado, hay que **recalcular** los puntos de ese partido y los totales.
- `puntos = null` mientras el partido no tiene resultado.

### Ranking
- Un único ranking **global y acumulativo** (no se reinicia).
- Visible para todos los usuarios, junto con las predicciones que hizo cada uno.
- Orden: 1) más puntos totales; 2) más **marcadores exactos** (predicciones de 5 puntos); 3) si siguen iguales **comparten posición** (1°, 2°, 2°, 4°) y se listan por nombre solo para mostrarlos.
- El backend debe poder contar los exactos por usuario (predicciones con `puntos = 5`). Implementación de referencia: `ordenarRanking` en `frontend/src/lib/mock-data.ts`.

### Roles y acceso
- Roles: `admin` y jugador (`user` en `PROJECT.md`, `jugador` en el frontend; **unificar nombre**).
- Los usuarios normales ven partidos, pronostican, historial y ranking.
- Solo `admin` accede a `/admin` y `/admin/usuarios`. Hoy el frontend **no restringe nada**; el backend debe verificar el rol en cada endpoint de administración.
- **El admin también es jugador:** pronostica, suma puntos y aparece en el ranking como cualquier otro usuario. Ser admin solo agrega la sección de administración.
- Siempre debe existir **al menos un admin**: el backend debe rechazar bloquear (o degradar) al último admin **activo**. El frontend ya deshabilita ese botón.
- Login: nombre de usuario + contraseña, sesión simple, sin recuperación por correo (por ahora). Contraseñas hasheadas.

### Jornadas
- Cada partido pertenece a una **jornada** (`jornada`, entero ≥ 1). El admin la captura al crear o editar un partido.
- Los partidos se agrupan por jornada en: pantalla de pronósticos (selector de jornada; abre por defecto en la jornada más reciente, la de número más alto), historial (con subtotal de puntos por jornada) y panel admin.
- El **ranking sigue siendo global y acumulativo**; las jornadas solo agrupan, no reinician puntos.
- Pendiente de confirmar: rango válido de jornadas (el frontend limita a 1–30) y si hay fases especiales (liguilla).

### Admin: partidos
- Crear, editar y eliminar partidos: equipo local, equipo visitante (**deben ser distintos**), jornada, fecha y hora (`horaPartido`, que también es la hora de cierre).
- Capturar el resultado final (goles de cada equipo).
- Estados: `proximo`, `en_vivo`, `finalizado`.
- Ver todas las predicciones de un partido y estadísticas de usuarios.
- **Eliminar un partido:** deja de contar por completo, aunque ya tenga pronósticos (e incluso resultado). Sus pronósticos no suman puntos ni marcadores exactos; el backend debe eliminarlos en cascada y **recalcular** los puntos totales y exactos del ranking. Desaparece también del historial de los usuarios.
- **Equipos:** solo se pueden usar los de la lista fija (ver sección 2). El backend debe rechazar equipos fuera de la lista.

### Admin: usuarios
- Crear, editar y **bloquear/desbloquear** usuarios. **Los usuarios no se eliminan.**
- Un usuario bloqueado no puede iniciar sesión (ni conservar una sesión abierta: el backend debe revisar el bloqueo en cada petición). Su historial y pronósticos se conservan, y al desbloquearlo todo sigue como estaba.
- Campo `bloqueado: boolean` en el modelo de usuario.
- Campos editables: nombre, correo, rol y contraseña. Al **editar**, la contraseña es opcional (vacía = no cambia); al **crear** es obligatoria. Mínimo 6 caracteres.

## 2. Diferencias entre `PROJECT.md` y el frontend (decidir)

1. ~~Equipos~~ **Resuelto:** solo se usan los equipos de una lista fija (18 de Liga MX, `frontend/src/lib/equipos.ts`), no son libres como decía `PROJECT.md`. Pendiente menor: decidir si la lista vive en código o en una tabla `equipos` (con logo) que solo el desarrollador modifica.
2. **Correo:** el frontend de usuarios tiene campo `correo`, pero `PROJECT.md` solo pide nombre de usuario y contraseña, sin correo. Decidir si se conserva y si es único.
3. **Logos:** los equipos muestran un escudo con siglas por defecto y logo PNG si existe en `frontend/public/logos/<slug>.png`. Si hay tabla de equipos, el logo podría guardarse ahí.

## 3. Pendientes por definir

- Si un usuario **bloqueado** sigue apareciendo en el ranking y sus pronósticos siguen visibles para los demás, o se oculta mientras esté bloqueado (el frontend de ejemplo no lo oculta).
- Si "en vivo" cambia por hora automáticamente o solo a mano.
- Rango de jornadas y fases especiales (liguilla, play-in).
- Política de contraseñas (longitud mínima real, cambio por el propio usuario).
- Base de datos (SQLite o PostgreSQL), hosting y deploy.

## 4. Dónde está en el código

- Datos y regla de puntos de ejemplo: `frontend/src/lib/mock-data.ts`
- Predictor y bloqueo por hora: `frontend/src/components/client/predictor.tsx`
- Admin de partidos: `frontend/src/components/client/admin-panel.tsx`
- Admin de usuarios: `frontend/src/components/client/usuarios-panel.tsx`
