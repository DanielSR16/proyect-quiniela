"use client";

import { useState } from "react";
import { Equipo } from "@/components/client/equipo";
import { Predictor } from "@/components/client/predictor";
import { calcularPuntos, formatearCorto, misPredicciones, partidos } from "@/lib/mock-data";

const jornadas = [...new Set(partidos.map((p) => p.jornada))].sort((a, b) => a - b);

// Por defecto se muestra la jornada más reciente (la de número más alto).
const jornadaActual = jornadas[jornadas.length - 1];

export function PartidosPorJornada() {
  const [jornada, setJornada] = useState(jornadaActual);

  const delaJornada = partidos.filter((p) => p.jornada === jornada);
  const proximos = delaJornada.filter((p) => p.resultadoLocal === null);
  const cerrados = delaJornada.filter((p) => p.resultadoLocal !== null && p.resultadoVisitante !== null);

  return (
    <div>
      <h1 className="text-5xl text-gold-400">Jornada {jornada}</h1>
      <p className="mb-5 mt-2 text-cream/70">Puedes cambiar tu pronóstico hasta la hora del partido.</p>

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

      {proximos.length > 0 && (
        <section className="ticket" aria-labelledby="por-jugar">
          <h2 id="por-jugar" className="etiqueta !font-sans">Por jugar</h2>
          {proximos.map((p) => (
            <Predictor
              key={p.id}
              local={p.local}
              visitante={p.visitante}
              hora={formatearCorto(p.horaPartido)}
              inicio={p.horaPartido}
              inicial={misPredicciones.find((m) => m.partidoId === p.id)}
            />
          ))}
        </section>
      )}

      {cerrados.length > 0 && (
        <section className="ticket ticket-cerrado" aria-labelledby="cerrados">
          <h2 id="cerrados" className="etiqueta !font-sans">Cerrados</h2>
          {cerrados.map((p) => {
            const pred = misPredicciones.find((m) => m.partidoId === p.id);
            const real = { local: p.resultadoLocal!, visitante: p.resultadoVisitante! };
            const puntos = pred ? calcularPuntos(pred, real) : null;
            return (
              <div key={p.id} className="fila">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-muted first-letter:uppercase">{formatearCorto(p.horaPartido)}</span>
                  <span className="uppercase tracking-widest text-muted">
                    {puntos === null ? "Sin pronóstico" : `+${puntos} pts`}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <Equipo nombre={p.local} className="flex-col text-center" claseEscudo="h-10 w-10" claseNombre="text-base" />
                  <span className="font-display text-4xl">{real.local} - {real.visitante}</span>
                  <Equipo nombre={p.visitante} className="flex-col text-center" claseEscudo="h-10 w-10" claseNombre="text-base" />
                </div>
                <p className="mt-2 text-center text-sm text-muted">
                  {pred
                    ? `Tu pronóstico: ${pred.local} - ${pred.visitante}`
                    : "No enviaste pronóstico para este partido"}
                </p>
              </div>
            );
          })}
        </section>
      )}

      {delaJornada.length === 0 && <p className="text-cream/70">Esta jornada todavía no tiene partidos.</p>}
    </div>
  );
}
