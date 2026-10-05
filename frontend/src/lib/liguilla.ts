import { JORNADAS_REGULARES } from "@/lib/jornadas";
import type { Partido } from "@/lib/tipos";

// Llaves de la liguilla armadas con los partidos que el admin carga en cada ronda
// (Cuartos, Semifinal y Final, ida y vuelta). No se calcula nada de la tabla: cada serie es
// una pareja de equipos que aparece en esas rondas, y el global es la suma de ida y vuelta.

export interface Equipo {
  id: number;
  nombre: string;
}

export interface Marcador {
  a: number;
  b: number;
}

export interface Serie {
  a: Equipo; // el local de la ida
  b: Equipo;
  ida: Marcador | null;
  vuelta: Marcador | null;
  global: Marcador | null; // solo con ida y vuelta jugadas
  ganador: Equipo | null; // null si falta algún partido o el global está empatado
}

export const FASES = ["Cuartos de final", "Semifinales", "Final"] as const;

const jugado = (p: Partido) => p.resultadoLocal !== null && p.resultadoVisitante !== null;

// Marcador de ese partido visto desde el equipo a.
const desde = (p: Partido | undefined, a: Equipo): Marcador | null => {
  if (!p || !jugado(p)) return null;
  return p.localId === a.id
    ? { a: p.resultadoLocal!, b: p.resultadoVisitante! }
    : { a: p.resultadoVisitante!, b: p.resultadoLocal! };
};

const mismaPareja = (p: Partido, a: Equipo, b: Equipo) =>
  (p.localId === a.id && p.visitanteId === b.id) || (p.localId === b.id && p.visitanteId === a.id);

function seriesDeFase(partidos: Partido[], fase: 0 | 1 | 2): Serie[] {
  const rondaIda = JORNADAS_REGULARES + 1 + fase * 2;
  const ordenados = partidos
    .filter((p) => p.jornada === rondaIda || p.jornada === rondaIda + 1)
    .sort((x, y) => x.jornada - y.jornada || x.horaPartido.localeCompare(y.horaPartido));

  const series: Serie[] = [];
  for (const p of ordenados) {
    const a = { id: p.localId, nombre: p.local };
    const b = { id: p.visitanteId, nombre: p.visitante };
    if (series.some((s) => mismaPareja(p, s.a, s.b))) continue;

    // El "a" de la serie es el local de la ida; si todavía no hay ida, el visitante de la vuelta.
    const delaPareja = ordenados.filter((x) => mismaPareja(x, a, b));
    const ida = delaPareja.find((x) => x.jornada === rondaIda);
    const vuelta = delaPareja.find((x) => x.jornada === rondaIda + 1);
    const local = ida ? { id: ida.localId, nombre: ida.local } : b;
    const visita = ida ? { id: ida.visitanteId, nombre: ida.visitante } : a;

    const mIda = desde(ida, local);
    const mVuelta = desde(vuelta, local);
    const global = mIda && mVuelta ? { a: mIda.a + mVuelta.a, b: mIda.b + mVuelta.b } : null;
    const ganador = global && global.a !== global.b ? (global.a > global.b ? local : visita) : null;
    series.push({ a: local, b: visita, ida: mIda, vuelta: mVuelta, global, ganador });
  }
  return series;
}

export function armarLlaves(partidos: Partido[]) {
  return FASES.map((nombre, i) => ({ nombre, series: seriesDeFase(partidos, i as 0 | 1 | 2) }));
}
