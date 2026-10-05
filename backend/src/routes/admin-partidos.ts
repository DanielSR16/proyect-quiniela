import { Router } from "express";
import { z } from "zod";
import { requerirAdmin, requerirSesion } from "../lib/auth.js";
import { consultar, transaccion } from "../lib/db.js";
import { EQUIPOS } from "../lib/equipos.js";
import { ErrorHttp } from "../lib/errores.js";
import { calcularPuntos } from "../lib/puntos.js";

export const adminPartidos = Router();
adminPartidos.use(requerirSesion, requerirAdmin);

const id = z.coerce.number().int().positive();
const equipo = z.enum(EQUIPOS, { message: "Ese equipo no está en la lista" });

const partido = z
  .object({
    local: equipo,
    visitante: equipo,
    jornada: z.number().int().min(1).max(30),
    // ISO con zona horaria, ej. new Date(valorDatetimeLocal).toISOString()
    horaPartido: z.string().datetime({ offset: true, message: "Hora inválida" }),
  })
  .refine((p) => p.local !== p.visitante, { message: "El local y el visitante deben ser distintos", path: ["visitante"] });

const SALIDA = `id, jornada, equipo_local as local, equipo_visitante as visitante, hora_partido as "horaPartido",
  resultado_local as "resultadoLocal", resultado_visitante as "resultadoVisitante", estado`;

adminPartidos.post("/", async (req, res) => {
  const p = partido.parse(req.body);
  const { rows } = await consultar(
    `insert into partidos (jornada, equipo_local, equipo_visitante, hora_partido)
     values ($1, $2, $3, $4) returning ${SALIDA}`,
    [p.jornada, p.local, p.visitante, p.horaPartido],
  );
  res.status(201).json(rows[0]);
});

adminPartidos.put("/:id", async (req, res) => {
  const p = partido.parse(req.body);
  const { rows } = await consultar(
    `update partidos set jornada = $2, equipo_local = $3, equipo_visitante = $4, hora_partido = $5
      where id = $1 returning ${SALIDA}`,
    [id.parse(req.params.id), p.jornada, p.local, p.visitante, p.horaPartido],
  );
  if (!rows[0]) throw new ErrorHttp(404, "Ese partido no existe");
  res.json(rows[0]);
});

// Eliminar un partido borra sus pronósticos (cascada): dejan de contar y el ranking se recalcula solo.
adminPartidos.delete("/:id", async (req, res) => {
  const { rowCount } = await consultar("delete from partidos where id = $1", [id.parse(req.params.id)]);
  if (!rowCount) throw new ErrorHttp(404, "Ese partido no existe");
  res.status(204).end();
});

const resultado = z.object({
  local: z.number().int().min(0).max(99),
  visitante: z.number().int().min(0).max(99),
});

// Captura (o corrige) el resultado final y recalcula los puntos de todos los pronósticos del partido.
adminPartidos.put("/:id/resultado", async (req, res) => {
  const partidoId = id.parse(req.params.id);
  const real = resultado.parse(req.body);

  const actualizado = await transaccion(async (db) => {
    const { rows } = await db.query(
      `update partidos set resultado_local = $2, resultado_visitante = $3, estado = 'finalizado'
        where id = $1 returning ${SALIDA}`,
      [partidoId, real.local, real.visitante],
    );
    if (!rows[0]) throw new ErrorHttp(404, "Ese partido no existe");

    const { rows: pronosticos } = await db.query<{ id: number; goles_local: number; goles_visitante: number }>(
      "select id, goles_local, goles_visitante from predicciones where partido_id = $1",
      [partidoId],
    );
    for (const pr of pronosticos) {
      const puntos = calcularPuntos({ local: pr.goles_local, visitante: pr.goles_visitante }, real);
      await db.query("update predicciones set puntos = $2 where id = $1", [pr.id, puntos]);
    }
    return rows[0];
  });
  res.json(actualizado);
});

// Estado manual mientras el partido no tiene resultado (próximo / en vivo).
adminPartidos.put("/:id/estado", async (req, res) => {
  const { estado } = z.object({ estado: z.enum(["proximo", "en_vivo"]) }).parse(req.body);
  const { rows } = await consultar(
    `update partidos set estado = $2 where id = $1 and resultado_local is null returning ${SALIDA}`,
    [id.parse(req.params.id), estado],
  );
  if (!rows[0]) throw new ErrorHttp(409, "El partido no existe o ya tiene resultado");
  res.json(rows[0]);
});
