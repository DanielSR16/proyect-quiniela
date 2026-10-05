// Crea el primer administrador: npm run crear-admin -w backend -- <nombre> <contraseña>
import bcrypt from "bcryptjs";
import { pool } from "../lib/db.js";

const [nombre, password] = process.argv.slice(2);
if (!nombre || !password || password.length < 6) {
  console.error("Uso: npm run crear-admin -w backend -- <nombre> <contraseña de mínimo 6 caracteres>");
  process.exit(1);
}

const { rows } = await pool.query(
  "insert into usuarios (nombre, rol, password_hash) values ($1, 'admin', $2) returning id, nombre, rol",
  [nombre, await bcrypt.hash(password, 10)],
);
console.log("Administrador creado:", rows[0]);
await pool.end();
