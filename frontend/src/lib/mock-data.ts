export interface Partido {
  id: number;
  local: string;
  visitante: string;
  horaPartido: string;
  resultadoLocal: number | null;
  resultadoVisitante: number | null;
}

export interface Prediccion {
  partidoId: number;
  local: number;
  visitante: number;
}

export interface Jugador {
  id: number;
  nombre: string;
  puntos: number;
}

export const partidos: Partido[] = [
  { id: 1, local: "América", visitante: "Chivas", horaPartido: "2026-10-10T19:00", resultadoLocal: null, resultadoVisitante: null },
  { id: 2, local: "Cruz Azul", visitante: "Pumas", horaPartido: "2026-10-10T21:00", resultadoLocal: null, resultadoVisitante: null },
  { id: 3, local: "Tigres", visitante: "Monterrey", horaPartido: "2026-10-03T19:00", resultadoLocal: 3, resultadoVisitante: 2 },
  { id: 4, local: "Toluca", visitante: "Santos", horaPartido: "2026-10-03T21:00", resultadoLocal: 1, resultadoVisitante: 1 },
];

export const misPredicciones: Prediccion[] = [
  { partidoId: 3, local: 3, visitante: 2 },
  { partidoId: 4, local: 2, visitante: 0 },
];

export const jugadores: Jugador[] = [
  { id: 1, nombre: "Carlos", puntos: 42 },
  { id: 2, nombre: "María", puntos: 38 },
  { id: 3, nombre: "Don Luis", puntos: 35 },
  { id: 4, nombre: "Daniel", puntos: 31 },
  { id: 5, nombre: "Rosa", puntos: 27 },
];

export function calcularPuntos(
  pred: { local: number; visitante: number },
  real: { local: number; visitante: number },
): number {
  if (pred.local === real.local && pred.visitante === real.visitante) return 5;
  if (Math.sign(pred.local - pred.visitante) === Math.sign(real.local - real.visitante)) return 3;
  return 0;
}

export function formatearHora(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}
