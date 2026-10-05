import bcrypt from "bcryptjs";
import { Router } from "express";
import type { PoolClient } from "pg";
import { z } from "zod";
import { requerirAdmin, requerirSesion } from "../lib/auth.js";
import { consultar, transaccion } from "../lib/db.js";
import { ErrorHttp } from "../lib/errores.js";

export const adminUsuarios = Router();
adminUsuarios.use(requerirSesion, requerirAdmin);

const id = z.coerce.number().int().positive();
const SALIDA = "id, nombre, correo, rol, bloqueado";

const base = {
  nombre: z.string().trim().min(1, "Escribe el nombre").max(60),
  correo: z.string().trim().email("Correo inválido").or(z.literal("")).optional(),
  rol: z.enum(["admin", "jugador"]),
};
const password = z.string().min(6, "La contraseña debe tener al menos 6 caracteres");

// Siempre debe quedar al menos un admin activo. Bloquea esas filas mientras se decide.
async function exigirOtroAdminActivo(db: PoolClient, excluirId: number) {
  const { rows } = await db.query(
    "select id from usuarios where rol = 'admin' and not bloqueado and id <> $1 for update",
    [excluirId],
  );
  if (rows.length === 0) throw new ErrorHttp(409, "Debe quedar al menos un administrador activo");
}

adminUsuarios.get("/", async (_req, res) => {
  const { rows } = await consultar(`select ${SALIDA} from usuarios order by lower(nombre)`);
  res.json(rows);
});

adminUsuarios.post("/", async (req, res) => {
  const d = z.object({ ...base, password }).parse(req.body);
  const { rows } = await consultar(
    `insert into usuarios (nombre, correo, rol, password_hash) values ($1, $2, $3, $4) returning ${SALIDA}`,
    [d.nombre, d.correo || null, d.rol, await bcrypt.hash(d.password, 10)],
  );
  res.status(201).json(rows[0]);
});

// Al editar, la contraseña es opcional (vacía o ausente = no cambia).
adminUsuarios.put("/:id", async (req, res) => {
  const usuarioId = id.parse(req.params.id);
  const d = z.object({ ...base, password: password.or(z.literal("")).optional() }).parse(req.body);

  const usuario = await transaccion(async (db) => {
    const { rows: actual } = await db.query("select rol, bloqueado from usuarios where id = $1 for update", [usuarioId]);
    if (!actual[0]) throw new ErrorHttp(404, "Ese usuario no existe");
    if (actual[0].rol === "admin" && !actual[0].bloqueado && d.rol !== "admin") await exigirOtroAdminActivo(db, usuarioId);

    const hash = d.password ? await bcrypt.hash(d.password, 10) : null;
    const { rows } = await db.query(
      `update usuarios set nombre = $2, correo = $3, rol = $4, password_hash = coalesce($5, password_hash)
        where id = $1 returning ${SALIDA}`,
      [usuarioId, d.nombre, d.correo || null, d.rol, hash],
    );
    return rows[0];
  });
  res.json(usuario);
});

// Los usuarios no se eliminan: se bloquean. Conservan historial y pronósticos.
adminUsuarios.patch("/:id/bloqueo", async (req, res) => {
  const usuarioId = id.parse(req.params.id);
  const { bloqueado } = z.object({ bloqueado: z.boolean() }).parse(req.body);

  const usuario = await transaccion(async (db) => {
    const { rows: actual } = await db.query("select rol, bloqueado from usuarios where id = $1 for update", [usuarioId]);
    if (!actual[0]) throw new ErrorHttp(404, "Ese usuario no existe");
    if (bloqueado && actual[0].rol === "admin" && !actual[0].bloqueado) await exigirOtroAdminActivo(db, usuarioId);

    const { rows } = await db.query(`update usuarios set bloqueado = $2 where id = $1 returning ${SALIDA}`, [usuarioId, bloqueado]);
    return rows[0];
  });
  res.json(usuario);
});
