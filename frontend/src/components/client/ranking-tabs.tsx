"use client";

import { useState } from "react";
import { detalleJugador, jugadores, jugadoresDeJornada, ordenarRanking, partidos } from "@/lib/mock-data";

const jornadas = [...new Set(partidos.map((p) => p.jornada))].sort((a, b) => a - b);

// Por defecto, siempre la jornada más reciente (la de número más alto).
const jornadaActual = jornadas[jornadas.length - 1];

type Vista = "general" | "jornada";

type Lista = ReturnType<typeof ordenarRanking>;

function Posicion({ n }: { n: number }) {
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center font-display text-2xl ${
        n === 1 ? "bg-forest-900 text-gold-400" : "border-2 border-dashed border-trazo"
      }`}
    >
      {n}
    </span>
  );
}

function Resumen({ j }: { j: Lista[number] }) {
  return (
    <>
      <Posicion n={j.posicion} />
      <span className="flex-1">
        <span className="block text-lg font-bold">{j.nombre}</span>
        <span className="block text-sm text-muted">{j.exactos} {j.exactos === 1 ? "marcador exacto" : "marcadores exactos"}</span>
      </span>
      <span className="font-display text-3xl">
        {j.puntos} <span className="font-sans text-sm text-muted">pts</span>
      </span>
    </>
  );
}

function Tabla({ lista, etiqueta }: { lista: Lista; etiqueta: string }) {
  return (
    <section className="ticket" aria-label={etiqueta}>
      <ol>
        {lista.map((j) => (
          <li key={j.id} className="fila flex items-center gap-4">
            <Resumen j={j} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function TablaJornada({ lista, jornada }: { lista: Lista; jornada: number }) {
  const [abierto, setAbierto] = useState<number | null>(null);

  return (
    <section className="ticket" aria-label={`Tabla de posiciones de la jornada ${jornada}`}>
      <ol>
        {lista.map((j) => {
          const detalle = detalleJugador(j.id, jornada);
          const expandido = abierto === j.id && detalle.length > 0;
          return (
            <li key={j.id} className="fila">
              <button
                type="button"
                disabled={detalle.length === 0}
                onClick={() => setAbierto(expandido ? null : j.id)}
                aria-expanded={expandido}
                className="flex w-full items-center gap-4 text-left"
              >
                <Resumen j={j} />
                {detalle.length > 0 && (
                  <span aria-hidden className={`text-muted transition-transform ${expandido ? "rotate-180" : ""}`}>▾</span>
                )}
              </button>

              {expandido && (
                <ul className="mt-4 border-t border-dashed border-trazo pt-2">
                  {detalle.map(({ partido, prediccion, puntos }) => (
                    <li key={partido.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="flex-1 text-sm">
                        <span className="block font-bold">{partido.local} vs {partido.visitante}</span>
                        <span className="block text-muted">
                          Resultado {partido.resultadoLocal} - {partido.resultadoVisitante} ·{" "}
                          {prediccion ? `Pronóstico ${prediccion.local} - ${prediccion.visitante}` : "Sin pronóstico"}
                        </span>
                      </span>
                      <span className={`font-display text-2xl ${puntos === 0 ? "text-muted" : ""}`}>+{puntos}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function RankingTabs() {
  const [vista, setVista] = useState<Vista>("general");
  const [jornada, setJornada] = useState(jornadaActual);

  const botonVista = (v: Vista, texto: string) => (
    <button
      type="button"
      onClick={() => setVista(v)}
      aria-current={vista === v ? "true" : undefined}
      className={`rounded-full border px-5 py-2 text-sm transition-colors ${
        vista === v
          ? "border-gold-400 bg-gold-400 font-bold text-forest-900"
          : "border-cream/30 text-cream hover:text-gold-400"
      }`}
    >
      {texto}
    </button>
  );

  return (
    <div>
      <h1 className="text-5xl text-gold-400">Posiciones</h1>
      <p className="mb-5 mt-2 text-cream/70">
        {vista === "general"
          ? "Los puntos acumulados de todos los participantes."
          : `Los puntos de cada participante solo en la jornada ${jornada}.`}{" "}
        Si hay empate, gana quien tenga más marcadores exactos.{vista === "jornada" && " Toca un jugador para ver sus marcadores."}
      </p>

      <div className="mb-4 flex gap-2">
        {botonVista("general", "General")}
        {botonVista("jornada", "Por jornada")}
      </div>

      {vista === "jornada" && (
        <nav aria-label="Jornadas" className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-2">
          {jornadas.map((j) => (
            <button
              key={j}
              type="button"
              onClick={() => setJornada(j)}
              aria-current={j === jornada ? "true" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                j === jornada
                  ? "border-gold-400 bg-gold-400 font-bold text-forest-900"
                  : "border-cream/30 text-cream hover:text-gold-400"
              }`}
            >
              Jornada {j}
            </button>
          ))}
        </nav>
      )}

      {vista === "general" ? (
        <Tabla lista={ordenarRanking(jugadores)} etiqueta="Tabla de posiciones general" />
      ) : (
        <TablaJornada key={jornada} lista={ordenarRanking(jugadoresDeJornada(jornada))} jornada={jornada} />
      )}
    </div>
  );
}
