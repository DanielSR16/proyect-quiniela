import { describe, expect, it } from "vitest";
import { detalleJugador, ordenarRanking, totalesPorJugador } from "@/lib/ranking";
import type { Partido } from "@/lib/tipos";

const partido = (id: number, jornada: number, rl: number | null, rv: number | null, hora = "2026-10-10T20:00:00Z"): Partido => ({
  id, localId: 1, local: "A", visitanteId: 2, visitante: "B", jornada, horaPartido: hora, resultadoLocal: rl, resultadoVisitante: rv,
});

describe("ordenarRanking", () => {
  it("ordena por puntos, luego exactos, y comparte posición en empates", () => {
    const r = ordenarRanking([
      { id: "1", nombre: "Ana", puntos: 10, exactos: 1 },
      { id: "2", nombre: "Beto", puntos: 10, exactos: 2 },
      { id: "3", nombre: "Carla", puntos: 10, exactos: 1 },
      { id: "4", nombre: "Dani", puntos: 3, exactos: 0 },
    ]);
    expect(r.map((j) => [j.nombre, j.posicion])).toEqual([["Beto", 1], ["Ana", 2], ["Carla", 2], ["Dani", 4]]);
  });

  it("no modifica la lista original", () => {
    const lista = [{ id: "1", nombre: "B", puntos: 1, exactos: 0 }, { id: "2", nombre: "A", puntos: 5, exactos: 0 }];
    ordenarRanking(lista);
    expect(lista[0].nombre).toBe("B");
  });
});

describe("totalesPorJugador", () => {
  const jugadores = [{ id: "u1", nombre: "Ana" }];
  const partidos = [partido(1, 1, 2, 1), partido(2, 1, 0, 0), partido(3, 2, 1, 1), partido(4, 2, null, null)];
  const preds = [
    { jugadorId: "u1", partidoId: 1, local: 2, visitante: 1, puntos: 5 },
    { jugadorId: "u1", partidoId: 2, local: 1, visitante: 0, puntos: 0 },
    { jugadorId: "u1", partidoId: 3, local: 0, visitante: 0, puntos: 3 },
    { jugadorId: "u1", partidoId: 4, local: 1, visitante: 0, puntos: null },
  ];

  it("suma puntos y exactos de partidos jugados", () => {
    expect(totalesPorJugador(jugadores, partidos, preds)[0]).toMatchObject({ puntos: 8, exactos: 1 });
  });

  it("filtra por jornada", () => {
    expect(totalesPorJugador(jugadores, partidos, preds, 2)[0]).toMatchObject({ puntos: 3, exactos: 0 });
  });

  it("ignora predicciones de partidos sin resultado", () => {
    const sinResultado = [partido(4, 1, null, null)];
    expect(totalesPorJugador(jugadores, sinResultado, [preds[3]])[0]).toMatchObject({ puntos: 0, exactos: 0 });
  });
});

describe("detalleJugador", () => {
  it("devuelve partidos jugados de la jornada ordenados por hora, con 0 puntos si no pronosticó", () => {
    const partidos = [
      partido(1, 1, 1, 0, "2026-10-10T22:00:00Z"),
      partido(2, 1, 2, 2, "2026-10-10T18:00:00Z"),
      partido(3, 1, null, null),
    ];
    const d = detalleJugador("u1", 1, partidos, [{ jugadorId: "u1", partidoId: 1, local: 1, visitante: 0, puntos: 5 }]);
    expect(d.map((x) => x.partido.id)).toEqual([2, 1]);
    expect(d[0]).toMatchObject({ prediccion: null, puntos: 0 });
    expect(d[1].puntos).toBe(5);
  });
});
