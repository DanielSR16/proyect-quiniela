import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { COOKIE, iniciarSesion, requerirSesion } from "../lib/auth.js";
import { config } from "../lib/config.js";
import { consultar } from "../lib/db.js";
import { ErrorHttp } from "../lib/errores.js";

export const auth = Router();

// Hash de relleno para que tardar lo mismo exista o no el usuario.
const HASH_FALSO = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.nXB6v1Z9yZ1iZ9oX3k1dPq0ZyQmO";

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos, espera unos minutos" },
});

const credenciales = z.object({ nombre: z.string().trim().min(1, "Escribe tu nombre"), password: z.string().min(1, "Escribe tu contraseña") });

auth.post("/login", limitarLogin, async (req, res) => {
  const { nombre, password } = credenciales.parse(req.body);
  const { rows } = await consultar<{ id: number; nombre: string; rol: string; bloqueado: boolean; password_hash: string }>(
    "select id, nombre, rol, bloqueado, password_hash from usuarios where lower(nombre) = lower($1)",
    [nombre],
  );
  const u = rows[0];
  const correcta = await bcrypt.compare(password, u?.password_hash ?? HASH_FALSO);
  if (!u || !correcta) throw new ErrorHttp(401, "Nombre o contraseña incorrectos");
  if (u.bloqueado) throw new ErrorHttp(403, "Tu cuenta está bloqueada. Habla con el administrador");

  iniciarSesion(res, u.id);
  res.json({ id: u.id, nombre: u.nombre, rol: u.rol });
});

auth.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE, { sameSite: config.produccion ? "none" : "lax", secure: config.produccion });
  res.status(204).end();
});

auth.get("/me", requerirSesion, (req, res) => {
  res.json(req.usuario);
});
