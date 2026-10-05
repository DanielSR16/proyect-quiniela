import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export class ErrorHttp extends Error {
  constructor(
    public estado: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}

export const manejarErrores: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ErrorHttp) {
    res.status(err.estado).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues[0]?.message ?? "Datos inválidos", detalles: err.issues });
    return;
  }
  // Violación de unicidad en Postgres (ej. nombre de usuario repetido)
  if (err?.code === "23505") {
    res.status(409).json({ error: "Ya existe un registro con esos datos" });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
};
