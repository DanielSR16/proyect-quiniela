import "dotenv/config";

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre} (ver backend/.env.example)`);
  return valor;
}

export const config = {
  databaseUrl: requerida("DATABASE_URL"),
  jwtSecret: requerida("JWT_SECRET"),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  port: Number(process.env.PORT ?? 4000),
  produccion: process.env.NODE_ENV === "production",
};
