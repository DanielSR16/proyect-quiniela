import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { consultar } from "./db.js";
import { ErrorHttp } from "./errores.js";

export interface UsuarioSesion {
  id: number;
  nombre: string;
  rol: "admin" | "jugador";
}

declare module "express-serve-static-core" {
  interface Request {
    usuario?: UsuarioSesion;
  }
}

export const COOKIE = "sesion";
const SIETE_DIAS = 7 * 24 * 60 * 60 * 1000;

export function iniciarSesion(res: Response, usuarioId: number) {
  const token = jwt.sign({ sub: usuarioId }, config.jwtSecret, { expiresIn: "7d" });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: config.produccion ? "none" : "lax",
    secure: config.produccion,
    maxAge: SIETE_DIAS,
  });
}

// Revisa la sesión y vuelve a leer al usuario de la BD en cada petición,
// así un usuario bloqueado o degradado pierde el acceso de inmediato.
export async function requerirSesion(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (!token) throw new ErrorHttp(401, "Debes iniciar sesión");

  let id: number;
  try {
    id = Number((jwt.verify(token, config.jwtSecret) as jwt.JwtPayload).sub);
  } catch {
    throw new ErrorHttp(401, "Tu sesión expiró, vuelve a entrar");
  }

  const { rows } = await consultar<UsuarioSesion & { bloqueado: boolean }>(
    "select id, nombre, rol, bloqueado from usuarios where id = $1",
    [id],
  );
  const u = rows[0];
  if (!u || u.bloqueado) throw new ErrorHttp(401, "Tu cuenta no tiene acceso");

  req.usuario = { id: u.id, nombre: u.nombre, rol: u.rol };
  next();
}

export function requerirAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.usuario?.rol !== "admin") throw new ErrorHttp(403, "Solo el administrador puede hacer esto");
  next();
}
