import { describe, expect, it } from "vitest";
import { esLiguilla, etiquetaCorta, nombreJornada } from "@/lib/jornadas";

describe("jornadas", () => {
  it("distingue fase regular de liguilla", () => {
    expect(esLiguilla(17)).toBe(false);
    expect(esLiguilla(18)).toBe(true);
  });

  it("nombra las rondas", () => {
    expect(nombreJornada(5)).toBe("Jornada 5");
    expect(nombreJornada(18)).toBe("Cuartos de final · Ida");
    expect(nombreJornada(19)).toBe("Cuartos de final · Vuelta");
    expect(nombreJornada(20)).toBe("Semifinal · Ida");
    expect(nombreJornada(23)).toBe("Final · Vuelta");
  });

  it("da etiquetas cortas", () => {
    expect(etiquetaCorta(5)).toBe("J5");
    expect(etiquetaCorta(18)).toBe("Cuartos ida");
    expect(etiquetaCorta(22)).toBe("Final ida");
  });
});
