import type { Database } from "@/lib/supabase/database.types";

type Tablas = Database["public"]["Tables"];

export type Rol = "admin" | "player";

// Respuesta de las Server Actions: éxito o un mensaje en español para mostrar.
export type Resultado = { ok: true } | { ok: false; error: string };

// Modelos que usa la interfaz (los nombres de columnas de la base están en inglés).
export interface Partido {
  id: number;
  localId: number;
  local: string;
  visitanteId: number;
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

// Consulta de partidos con el nombre de cada equipo (se relacionan por id).
export const PARTIDO_SELECT = "*, home:teams!home_team_id(name), away:teams!away_team_id(name)";

export type FilaPartido = Tablas["matches"]["Row"] & { home: { name: string } | null; away: { name: string } | null };

export function aPartido(fila: FilaPartido): Partido {
  return {
    id: fila.id,
    localId: fila.home_team_id,
    local: fila.home?.name ?? "",
    visitanteId: fila.away_team_id,
    visitante: fila.away?.name ?? "",
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
