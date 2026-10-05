// Fase regular: jornadas 1-17. Liguilla: rondas de ida y vuelta, numeradas a continuación.
export const JORNADAS_REGULARES = 17;
export const TOTAL_JORNADAS = 23;

const LIGUILLA = ["Cuartos de final", "Semifinal", "Final"];
const CORTAS = ["Cuartos", "Semi", "Final"];

export const esLiguilla = (n: number) => n > JORNADAS_REGULARES;

// 18 -> { fase: 0, partido: "Ida" }, 19 -> { fase: 0, partido: "Vuelta" }, 20 -> { fase: 1, ... }
function datosLiguilla(n: number) {
  const i = n - JORNADAS_REGULARES - 1;
  return { fase: Math.floor(i / 2), partido: i % 2 === 0 ? "Ida" : "Vuelta" };
}

// "Jornada 5" o "Cuartos de final · Ida".
export function nombreJornada(n: number): string {
  if (!esLiguilla(n)) return `Jornada ${n}`;
  const { fase, partido } = datosLiguilla(n);
  return `${LIGUILLA[fase]} · ${partido}`;
}

// Versión corta para botones: "J5", "Cuartos ida".
export function etiquetaCorta(n: number): string {
  if (!esLiguilla(n)) return `J${n}`;
  const { fase, partido } = datosLiguilla(n);
  return `${CORTAS[fase]} ${partido.toLowerCase()}`;
}
