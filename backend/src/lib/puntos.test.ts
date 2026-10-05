import assert from "node:assert/strict";
import { test } from "node:test";
import { calcularPuntos } from "./puntos.js";

test("marcador exacto da 5", () => assert.equal(calcularPuntos({ local: 3, visitante: 2 }, { local: 3, visitante: 2 }), 5));
test("ganador correcto con otro marcador da 3", () =>
  assert.equal(calcularPuntos({ local: 1, visitante: 0 }, { local: 3, visitante: 2 }), 3));
test("ganador visitante correcto da 3", () =>
  assert.equal(calcularPuntos({ local: 0, visitante: 2 }, { local: 1, visitante: 3 }), 3));
test("empate con otro marcador de empate da 3", () =>
  assert.equal(calcularPuntos({ local: 0, visitante: 0 }, { local: 1, visitante: 1 }), 3));
test("resultado incorrecto da 0", () => assert.equal(calcularPuntos({ local: 1, visitante: 2 }, { local: 3, visitante: 2 }), 0));
test("predecir empate cuando gana alguien da 0", () =>
  assert.equal(calcularPuntos({ local: 1, visitante: 1 }, { local: 2, visitante: 0 }), 0));
