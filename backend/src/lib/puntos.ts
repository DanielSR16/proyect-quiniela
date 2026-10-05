export interface Marcador {
  local: number;
  visitante: number;
}

// 5 = marcador exacto; 3 = resultado correcto (gana local, gana visitante o empate); 0 = falló.
export function calcularPuntos(pronostico: Marcador, real: Marcador): 0 | 3 | 5 {
  if (pronostico.local === real.local && pronostico.visitante === real.visitante) return 5;
  if (Math.sign(pronostico.local - pronostico.visitante) === Math.sign(real.local - real.visitante)) return 3;
  return 0;
}
