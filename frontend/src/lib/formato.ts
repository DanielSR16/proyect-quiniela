// Todas las horas se muestran (y se capturan) en hora de la Ciudad de México.
// México ya no usa horario de verano, así que su desfase es fijo: UTC-6.
const ZONA = "America/Mexico_City";
const DESFASE = "-06:00";

export function formatearHora(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: ZONA,
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
      timeZone: ZONA,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " ·");
}

// ISO -> valor para <input type="datetime-local"> (hora de México).
export function aInputLocal(iso: string): string {
  return new Date(iso).toLocaleString("sv-SE", { timeZone: ZONA }).replace(" ", "T").slice(0, 16);
}

// Valor de <input type="datetime-local"> (hora de México) -> ISO con zona.
export function desdeInputLocal(valor: string): string {
  return new Date(`${valor}:00${DESFASE}`).toISOString();
}

// Agrupa por jornada (más reciente primero); dentro de cada una, por hora.
export function agruparPorJornada<T extends { jornada: number; horaPartido: string }>(lista: T[]): [number, T[]][] {
  const mapa = new Map<number, T[]>();
  for (const p of lista) mapa.set(p.jornada, [...(mapa.get(p.jornada) ?? []), p]);
  return [...mapa.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([j, ps]) => [j, ps.sort((a, b) => a.horaPartido.localeCompare(b.horaPartido))]);
}

// "12 – 15 oct" a partir de las horas de los partidos de una jornada (hora de México).
// Si todos son el mismo día, solo "12 oct"; si cruzan de mes, "30 sep – 2 oct".
export function rangoFechas(horas: string[]): string | null {
  if (horas.length === 0) return null;
  const orden = [...horas].sort();
  const parte = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleString("es-MX", { timeZone: ZONA, ...opts });
  const dia = (iso: string) => parte(iso, { day: "numeric" });
  const mes = (iso: string) => parte(iso, { month: "short" }).replace(".", "");
  const corto = (iso: string) => `${dia(iso)} ${mes(iso)}`;

  const ini = orden[0];
  const fin = orden[orden.length - 1];
  if (corto(ini) === corto(fin)) return corto(ini);
  return mes(ini) === mes(fin) ? `${dia(ini)} – ${corto(fin)}` : `${corto(ini)} – ${corto(fin)}`;
}
