import type { Jugador, Partido, Prediccion } from "@/lib/tipos";

// Los puntos de cada pronóstico los calcula la base de datos (trigger al capturar el resultado):
// 5 marcador exacto, 3 resultado correcto, 0 en otro caso. Aquí solo se suman y se ordenan.

export type PrediccionDeJugador = Prediccion & { jugadorId: string };

export interface JugadorPosicionado extends Jugador {
  posicion: number;
}

const jugado = (p: Partido) => p.resultadoLocal !== null && p.resultadoVisitante !== null;

// Puntos y exactos de cada jugador, en todo el torneo o solo en una jornada.
export function totalesPorJugador(
  jugadores: { id: string; nombre: string }[],
  partidos: Partido[],
  predicciones: PrediccionDeJugador[],
  jornada?: number,
): Jugador[] {
  const validos = new Set(partidos.filter((p) => jugado(p) && (jornada === undefined || p.jornada === jornada)).map((p) => p.id));
  return jugadores.map((j) => {
    const suyas = predicciones.filter((x) => x.jugadorId === j.id && validos.has(x.partidoId));
    return {
      ...j,
      puntos: suyas.reduce((suma, x) => suma + (x.puntos ?? 0), 0),
      exactos: suyas.filter((x) => x.puntos === 5).length,
    };
  });
}

// Orden: más puntos, luego más marcadores exactos; si siguen iguales comparten posición (1, 2, 2, 4).
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

export interface DetallePartido {
  partido: Partido;
  prediccion: Prediccion | null;
  puntos: number;
}

// Partidos ya jugados de una jornada con el pronóstico y los puntos de un jugador.
export function detalleJugador(
  jugadorId: string,
  jornada: number,
  partidos: Partido[],
  predicciones: PrediccionDeJugador[],
): DetallePartido[] {
  return partidos
    .filter((p) => p.jornada === jornada && jugado(p))
    .sort((a, b) => a.horaPartido.localeCompare(b.horaPartido))
    .map((partido) => {
      const prediccion = predicciones.find((x) => x.jugadorId === jugadorId && x.partidoId === partido.id) ?? null;
      return { partido, prediccion, puntos: prediccion?.puntos ?? 0 };
    });
}
