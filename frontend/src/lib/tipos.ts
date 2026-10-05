import type { Database } from "@/lib/supabase/database.types";

type Tablas = Database["public"]["Tables"];

export type Rol = "admin" | "player";

// Respuesta de las Server Actions: éxito o un mensaje en español para mostrar.
export type Resultado = { ok: true } | { ok: false; error: string };

// Modelos que usa la interfaz (los nombres de columnas de la base están en inglés).
export interface Partido {
  id: number;
  local: string;
  visitante: string;
  jornada: number;
  horaPartido: string; // ISO con zona
  resultadoLocal: number | null;
  resultadoVisitante: number | null;
}

export interface Prediccion {
  partidoId: number;
  local: number;
  visitante: number;
  puntos: number | null; // null mientras el partido no tiene resultado
}

export interface Jugador {
  id: string;
  nombre: string;
  puntos: number;
  exactos: number;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  bloqueado: boolean;
}

export function aPartido(fila: Tablas["matches"]["Row"]): Partido {
  return {
    id: fila.id,
    local: fila.home_team,
    visitante: fila.away_team,
    jornada: fila.round,
    horaPartido: fila.kickoff_at,
    resultadoLocal: fila.home_score,
    resultadoVisitante: fila.away_score,
  };
}

export function aPrediccion(
  fila: Pick<Tablas["predictions"]["Row"], "match_id" | "home_goals" | "away_goals" | "points">,
): Prediccion {
  return { partidoId: fila.match_id, local: fila.home_goals, visitante: fila.away_goals, puntos: fila.points };
}
