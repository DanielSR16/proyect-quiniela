export interface InfoEquipo {
  siglas: string;
  fondo: string;
  texto: string;
}

const info: Record<string, InfoEquipo> = {
  "América": { siglas: "AME", fondo: "#f5c400", texto: "#0b2a6b" },
  "Atlante": { siglas: "ATN", fondo: "#c8102e", texto: "#ffffff" },
  "Atlas": { siglas: "ATL", fondo: "#c8102e", texto: "#ffffff" },
  "Atlético San Luis": { siglas: "ASL", fondo: "#d71920", texto: "#ffffff" },
  "Cruz Azul": { siglas: "CAZ", fondo: "#1b3f94", texto: "#ffffff" },
  "Chivas": { siglas: "CHI", fondo: "#cd1f2f", texto: "#ffffff" },
  "FC Juárez": { siglas: "JUA", fondo: "#2e8b3a", texto: "#ffffff" },
  "León": { siglas: "LEO", fondo: "#00693c", texto: "#f5c400" },
  "Mazatlán": { siglas: "MAZ", fondo: "#4b2a83", texto: "#ffffff" },
  "Monterrey": { siglas: "MTY", fondo: "#0b2a6b", texto: "#ffffff" },
  "Necaxa": { siglas: "NEC", fondo: "#d5192d", texto: "#ffffff" },
  "Pachuca": { siglas: "PAC", fondo: "#1d3f8a", texto: "#ffffff" },
  "Puebla": { siglas: "PUE", fondo: "#1f4fa3", texto: "#ffffff" },
  "Pumas": { siglas: "PUM", fondo: "#c9a227", texto: "#0b2a6b" },
  "Querétaro": { siglas: "QRO", fondo: "#1f4fa3", texto: "#ffffff" },
  "Santos": { siglas: "SAN", fondo: "#1a7a3c", texto: "#ffffff" },
  "Tigres": { siglas: "TIG", fondo: "#f4b81a", texto: "#0b2a6b" },
  "Tijuana": { siglas: "TIJ", fondo: "#c8102e", texto: "#ffffff" },
  "Toluca": { siglas: "TOL", fondo: "#c8102e", texto: "#ffffff" },
};

export function infoEquipo(nombre: string): InfoEquipo {
  return info[nombre] ?? { siglas: nombre.slice(0, 3).toUpperCase(), fondo: "#214a39", texto: "#f3ead7" };
}

export function slugEquipo(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Slugs de los equipos que ya tienen archivo en public/logos/<slug>.png.
// Agrega aquí el slug al subir un logo; los demás usan el escudo con siglas.
export const logosDisponibles: string[] = [
  "america", "atlante", "atlas", "atletico-san-luis", "chivas", "cruz-azul", "fc-juarez",
  "leon", "mazatlan", "monterrey", "necaxa", "pachuca", "puebla",
  "pumas", "queretaro", "santos", "tigres", "tijuana", "toluca",
];
