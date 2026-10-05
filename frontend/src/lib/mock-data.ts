export interface Partido {
  id: number;
  local: string;
  visitante: string;
  jornada: number;
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
  exactos: number;
}

export type Rol = "admin" | "jugador";

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  bloqueado: boolean;
}

export const usuarios: Usuario[] = [
  { id: 1, nombre: "Carlos", correo: "carlos@correo.com", rol: "jugador", bloqueado: false },
  { id: 2, nombre: "María", correo: "maria@correo.com", rol: "jugador", bloqueado: false },
  { id: 3, nombre: "Don Luis", correo: "luis@correo.com", rol: "jugador", bloqueado: false },
  { id: 4, nombre: "Daniel", correo: "daniel@correo.com", rol: "admin", bloqueado: false },
  { id: 5, nombre: "Rosa", correo: "rosa@correo.com", rol: "jugador", bloqueado: false },
];

export const equipos: string[] = [
  "América", "Atlas", "Atlético San Luis", "Cruz Azul", "Chivas", "FC Juárez",
  "León", "Mazatlán", "Monterrey", "Necaxa", "Pachuca", "Puebla",
  "Pumas", "Querétaro", "Santos", "Tigres", "Tijuana", "Toluca",
];

export const partidos: Partido[] = [
  { id: 1, jornada: 10, local: "América", visitante: "Chivas", horaPartido: "2026-10-10T19:00", resultadoLocal: null, resultadoVisitante: null },
  { id: 2, jornada: 10, local: "Cruz Azul", visitante: "Pumas", horaPartido: "2026-10-10T21:00", resultadoLocal: null, resultadoVisitante: null },
  { id: 3, jornada: 9, local: "Tigres", visitante: "Monterrey", horaPartido: "2026-10-03T19:00", resultadoLocal: 3, resultadoVisitante: 2 },
  { id: 4, jornada: 9, local: "Toluca", visitante: "Santos", horaPartido: "2026-10-03T21:00", resultadoLocal: 1, resultadoVisitante: 1 },
  { id: 5, jornada: 8, local: "Pachuca", visitante: "Puebla", horaPartido: "2026-09-26T19:00", resultadoLocal: 2, resultadoVisitante: 0 },
  { id: 6, jornada: 8, local: "León", visitante: "Atlas", horaPartido: "2026-09-26T21:00", resultadoLocal: 1, resultadoVisitante: 1 },
];

export const misPredicciones: Prediccion[] = [
  { partidoId: 3, local: 3, visitante: 2 },
  { partidoId: 4, local: 2, visitante: 0 },
];

export const jugadores: Jugador[] = [
  { id: 1, nombre: "Carlos", puntos: 42, exactos: 5 },
  { id: 2, nombre: "María", puntos: 38, exactos: 4 },
  { id: 3, nombre: "Don Luis", puntos: 35, exactos: 3 },
  { id: 4, nombre: "Daniel", puntos: 31, exactos: 3 },
  { id: 5, nombre: "Rosa", puntos: 27, exactos: 2 },
];

export function calcularPuntos(
  pred: { local: number; visitante: number },
  real: { local: number; visitante: number },
): number {
  if (pred.local === real.local && pred.visitante === real.visitante) return 5;
  if (Math.sign(pred.local - pred.visitante) === Math.sign(real.local - real.visitante)) return 3;
  return 0;
}

// Pronósticos de cada jugador (id de jugador -> pronósticos).
export const prediccionesPorJugador: Record<number, Prediccion[]> = {
  1: [{ partidoId: 3, local: 3, visitante: 2 }, { partidoId: 4, local: 1, visitante: 1 }, { partidoId: 5, local: 2, visitante: 0 }, { partidoId: 6, local: 0, visitante: 1 }],
  2: [{ partidoId: 3, local: 2, visitante: 1 }, { partidoId: 4, local: 1, visitante: 1 }, { partidoId: 5, local: 1, visitante: 0 }, { partidoId: 6, local: 1, visitante: 1 }],
  3: [{ partidoId: 3, local: 1, visitante: 0 }, { partidoId: 4, local: 0, visitante: 0 }, { partidoId: 5, local: 2, visitante: 1 }, { partidoId: 6, local: 2, visitante: 2 }],
  4: [...misPredicciones, { partidoId: 5, local: 0, visitante: 0 }, { partidoId: 6, local: 1, visitante: 1 }],
  5: [{ partidoId: 3, local: 0, visitante: 1 }, { partidoId: 4, local: 1, visitante: 1 }, { partidoId: 5, local: 2, visitante: 0 }],
};

export interface DetallePartido {
  partido: Partido;
  prediccion: Prediccion | null;
  puntos: number;
}

// Partidos ya jugados de una jornada con el pronóstico y los puntos de un jugador.
export function detalleJugador(jugadorId: number, jornada: number): DetallePartido[] {
  return partidos
    .filter((p) => p.jornada === jornada && p.resultadoLocal !== null && p.resultadoVisitante !== null)
    .sort((a, b) => a.horaPartido.localeCompare(b.horaPartido))
    .map((partido) => {
      const prediccion = prediccionesPorJugador[jugadorId]?.find((x) => x.partidoId === partido.id) ?? null;
      const real = { local: partido.resultadoLocal!, visitante: partido.resultadoVisitante! };
      return { partido, prediccion, puntos: prediccion ? calcularPuntos(prediccion, real) : 0 };
    });
}

// Puntos y exactos de cada jugador en una jornada; sin resultados todos quedan en 0.
export function jugadoresDeJornada(jornada: number): Jugador[] {
  return jugadores.map((j) => {
    const detalle = detalleJugador(j.id, jornada);
    return {
      ...j,
      puntos: detalle.reduce((t, d) => t + d.puntos, 0),
      exactos: detalle.filter((d) => d.puntos === 5).length,
    };
  });
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

export function formatearCorto(iso: string): string {
  return new Date(iso)
    .toLocaleString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " ·");
}

export interface JugadorPosicionado extends Jugador {
  posicion: number;
}

// Orden: más puntos, luego más marcadores exactos; si siguen iguales comparten posición.
export function ordenarRanking(lista: Jugador[]): JugadorPosicionado[] {
  const ordenados = [...lista].sort(
    (a, b) => b.puntos - a.puntos || b.exactos - a.exactos || a.nombre.localeCompare(b.nombre, "es"),
  );
  const resultado: JugadorPosicionado[] = [];
  ordenados.forEach((j, i) => {
    const previo = resultado[i - 1];
    const empatado = previo && previo.puntos === j.puntos && previo.exactos === j.exactos;
    resultado.push({ ...j, posicion: empatado ? previo.posicion : i + 1 });
  });
  return resultado;
}

// Agrupa partidos por jornada (más reciente primero); dentro de cada una, por hora.
export function agruparPorJornada<T extends { jornada: number; horaPartido: string }>(lista: T[]): [number, T[]][] {
  const mapa = new Map<number, T[]>();
  for (const p of lista) mapa.set(p.jornada, [...(mapa.get(p.jornada) ?? []), p]);
  return [...mapa.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([j, ps]) => [j, ps.sort((a, b) => a.horaPartido.localeCompare(b.horaPartido))]);
}
