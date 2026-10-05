import { Router } from "express";
import { z } from "zod";
import { requerirSesion } from "../lib/auth.js";
import { consultar } from "../lib/db.js";
import { ErrorHttp } from "../lib/errores.js";
import { calcularRanking } from "../lib/ranking.js";

export const jugador = Router();
jugador.use(requerirSesion);

const id = z.coerce.number().int().positive();
const jornadaOpcional = z.coerce.number().int().min(1).max(30).optional();

const COLUMNAS_PARTIDO = `m.id, m.jornada, m.equipo_local as local, m.equipo_visitante as visitante,
  m.hora_partido as "horaPartido", m.resultado_local as "resultadoLocal",
  m.resultado_visitante as "resultadoVisitante", m.estado`;

// Partidos (opcionalmente de una jornada) con el pronóstico del usuario que consulta.
jugador.get("/partidos", async (req, res) => {
  const jornada = jornadaOpcional.parse(req.query.jornada);
  const { rows } = await consultar(
    `select ${COLUMNAS_PARTIDO},
            case when p.id is null then null
                 else json_build_object('local', p.goles_local, 'visitante', p.goles_visitante, 'puntos', p.puntos)
            end as "miPrediccion"
       from partidos m
       left join predicciones p on p.partido_id = m.id and p.usuario_id = $1
      where ($2::int is null or m.jornada = $2)
      order by m.jornada desc, m.hora_partido`,
    [req.usuario!.id, jornada ?? null],
  );
  res.json(rows);
});

const pronostico = z.object({
  local: z.number().int().min(0).max(20),
  visitante: z.number().int().min(0).max(20),
});

// Crear o reemplazar el pronóstico propio. El cierre lo valida el servidor con su reloj.
jugador.put("/partidos/:id/prediccion", async (req, res) => {
  const partidoId = id.parse(req.params.id);
  const { local, visitante } = pronostico.parse(req.body);

  const { rows } = await consultar<{ cerrado: boolean }>(
    "select (hora_partido <= now() or resultado_local is not null) as cerrado from partidos where id = $1",
    [partidoId],
  );
  if (!rows[0]) throw new ErrorHttp(404, "Ese partido no existe");
  if (rows[0].cerrado) throw new ErrorHttp(409, "Los pronósticos de este partido ya cerraron");

  const { rows: guardada } = await consultar(
    `insert into predicciones (usuario_id, partido_id, goles_local, goles_visitante)
     values ($1, $2, $3, $4)
     on conflict (usuario_id, partido_id)
     do update set goles_local = excluded.goles_local, goles_visitante = excluded.goles_visitante, actualizado_en = now()
     returning partido_id as "partidoId", goles_local as local, goles_visitante as visitante, puntos`,
    [req.usuario!.id, partidoId, local, visitante],
  );
  res.json(guardada[0]);
});

// Pronósticos de todos en un partido; solo visibles cuando el partido ya cerró (o si eres admin).
jugador.get("/partidos/:id/predicciones", async (req, res) => {
  const partidoId = id.parse(req.params.id);
  const { rows } = await consultar<{ cerrado: boolean }>(
    "select (hora_partido <= now() or resultado_local is not null) as cerrado from partidos where id = $1",
    [partidoId],
  );
  if (!rows[0]) throw new ErrorHttp(404, "Ese partido no existe");
  if (!rows[0].cerrado && req.usuario!.rol !== "admin") {
    throw new ErrorHttp(403, "Los pronósticos de los demás se ven cuando cierra el partido");
  }

  const { rows: lista } = await consultar(
    `select u.id as "usuarioId", u.nombre, p.goles_local as local, p.goles_visitante as visitante, p.puntos
       from predicciones p join usuarios u on u.id = p.usuario_id
      where p.partido_id = $1
      order by u.nombre`,
    [partidoId],
  );
  res.json(lista);
});

// Historial propio: partidos ya con resultado, con su pronóstico y puntos.
jugador.get("/historial", async (req, res) => {
  const { rows } = await consultar(
    `select ${COLUMNAS_PARTIDO},
            case when p.id is null then null
                 else json_build_object('local', p.goles_local, 'visitante', p.goles_visitante)
            end as "miPrediccion",
            coalesce(p.puntos, 0) as puntos
       from partidos m
       left join predicciones p on p.partido_id = m.id and p.usuario_id = $1
      where m.resultado_local is not null
      order by m.jornada desc, m.hora_partido`,
    [req.usuario!.id],
  );
  res.json(rows);
});

// Ranking global (acumulado) o de una sola jornada con ?jornada=N.
jugador.get("/ranking", async (req, res) => {
  const jornada = jornadaOpcional.parse(req.query.jornada);
  res.json(await calcularRanking(jornada));
});

// Detalle de un jugador en una jornada: partidos jugados, su marcador y los puntos de cada uno.
jugador.get("/ranking/jugadores/:id", async (req, res) => {
  const jugadorId = id.parse(req.params.id);
  const jornada = z.coerce.number().int().min(1).max(30).parse(req.query.jornada);
  const { rows } = await consultar(
    `select ${COLUMNAS_PARTIDO},
            case when p.id is null then null
                 else json_build_object('local', p.goles_local, 'visitante', p.goles_visitante)
            end as prediccion,
            coalesce(p.puntos, 0) as puntos
       from partidos m
       left join predicciones p on p.partido_id = m.id and p.usuario_id = $1
      where m.jornada = $2 and m.resultado_local is not null
      order by m.hora_partido`,
    [jugadorId, jornada],
  );
  res.json(rows);
});
