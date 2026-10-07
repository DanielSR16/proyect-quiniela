import { describe, expect, it } from "vitest";
import { agruparPorJornada, aInputLocal, desdeInputLocal, rangoFechas } from "@/lib/formato";

describe("formato", () => {
  it("convierte hora de México a ISO y de vuelta (UTC-6)", () => {
    expect(desdeInputLocal("2026-10-10T20:00")).toBe("2026-10-11T02:00:00.000Z");
    expect(aInputLocal("2026-10-11T02:00:00.000Z")).toBe("2026-10-10T20:00");
  });

  it("agrupa por jornada, la más reciente primero y por hora dentro de cada una", () => {
    const g = agruparPorJornada([
      { jornada: 1, horaPartido: "2026-10-01T20:00:00Z" },
      { jornada: 2, horaPartido: "2026-10-09T20:00:00Z" },
      { jornada: 2, horaPartido: "2026-10-08T20:00:00Z" },
    ]);
    expect(g.map(([j]) => j)).toEqual([2, 1]);
    expect(g[0][1].map((x) => x.horaPartido)).toEqual(["2026-10-08T20:00:00Z", "2026-10-09T20:00:00Z"]);
  });

  it("rangoFechas: vacío, un día, mismo mes y cruce de mes", () => {
    expect(rangoFechas([])).toBeNull();
    expect(rangoFechas(["2026-10-12T20:00:00Z"])).toMatch(/^12 oct/);
    expect(rangoFechas(["2026-10-12T20:00:00Z", "2026-10-15T20:00:00Z"])).toMatch(/^12 – 15 oct/);
    expect(rangoFechas(["2026-09-30T20:00:00Z", "2026-10-02T20:00:00Z"])).toMatch(/^30 sep – 2 oct/);
  });
});
