import { describe, expect, it } from "vitest";
import { armarLlaves } from "@/lib/liguilla";
import type { Partido } from "@/lib/tipos";

let id = 0;
const p = (jornada: number, localId: number, visitanteId: number, rl: number | null, rv: number | null): Partido => ({
  id: ++id, localId, local: `E${localId}`, visitanteId, visitante: `E${visitanteId}`, jornada,
  horaPartido: `2026-12-0${jornada - 17}T20:00:00Z`, resultadoLocal: rl, resultadoVisitante: rv,
});

describe("armarLlaves", () => {
  it("sin partidos devuelve las tres fases vacías", () => {
    const l = armarLlaves([]);
    expect(l.map((f) => f.nombre)).toEqual(["Cuartos de final", "Semifinales", "Final"]);
    expect(l.every((f) => f.series.length === 0)).toBe(true);
  });

  it("calcula global y ganador sumando ida y vuelta desde el local de la ida", () => {
    // Ida: E1 2-0 E2. Vuelta (E2 local): E2 3-0 E1 -> global E1 2, E2 3 -> gana E2.
    const [cuartos] = armarLlaves([p(18, 1, 2, 2, 0), p(19, 2, 1, 3, 0)]);
    expect(cuartos.series).toHaveLength(1);
    const s = cuartos.series[0];
    expect(s.a.id).toBe(1);
    expect(s.ida).toEqual({ a: 2, b: 0 });
    expect(s.vuelta).toEqual({ a: 0, b: 3 });
    expect(s.global).toEqual({ a: 2, b: 3 });
    expect(s.ganador?.id).toBe(2);
  });

  it("sin ganador si falta la vuelta o el global empata", () => {
    const [soloIda] = armarLlaves([p(18, 1, 2, 1, 0)]);
    expect(soloIda.series[0]).toMatchObject({ global: null, ganador: null });
    const [empate] = armarLlaves([p(18, 1, 2, 1, 0), p(19, 2, 1, 1, 0)]);
    expect(empate.series[0].global).toEqual({ a: 1, b: 1 });
    expect(empate.series[0].ganador).toBeNull();
  });

  it("con solo la vuelta cargada, el local de la serie es el visitante de la vuelta", () => {
    const [c] = armarLlaves([p(19, 2, 1, null, null)]);
    expect(c.series[0].a.id).toBe(1);
  });

  it("ubica cada ronda en su fase", () => {
    const l = armarLlaves([p(20, 3, 4, 1, 0), p(22, 5, 6, 0, 0)]);
    expect(l[0].series).toHaveLength(0);
    expect(l[1].series[0].a.id).toBe(3);
    expect(l[2].series[0].a.id).toBe(5);
  });
});
