import pg from "pg";
import { config } from "./config.js";

const local = /localhost|127\.0\.0\.1/.test(config.databaseUrl);

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  // Supabase exige SSL; en una base local no.
  ssl: local ? false : { rejectUnauthorized: false },
});

export const consultar = <T extends pg.QueryResultRow>(sql: string, params: unknown[] = []) =>
  pool.query<T>(sql, params);

export async function transaccion<T>(fn: (cliente: pg.PoolClient) => Promise<T>): Promise<T> {
  const cliente = await pool.connect();
  try {
    await cliente.query("begin");
    const resultado = await fn(cliente);
    await cliente.query("commit");
    return resultado;
  } catch (e) {
    await cliente.query("rollback");
    throw e;
  } finally {
    cliente.release();
  }
}
