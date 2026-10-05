import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./lib/config.js";
import { manejarErrores } from "./lib/errores.js";
import { adminPartidos } from "./routes/admin-partidos.js";
import { adminUsuarios } from "./routes/admin-usuarios.js";
import { auth } from "./routes/auth.js";
import { jugador } from "./routes/jugador.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/salud", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", auth);
app.use("/api/admin/partidos", adminPartidos);
app.use("/api/admin/usuarios", adminUsuarios);
app.use("/api", jugador);

app.use((_req, res) => {
  res.status(404).json({ error: "No encontrado" });
});
app.use(manejarErrores);
