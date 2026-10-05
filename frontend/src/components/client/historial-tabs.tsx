"use client";

import { useState } from "react";
import { Equipo } from "@/components/client/equipo";
import { agruparPorJornada, formatearCorto, rangoFechas } from "@/lib/formato";
import type { Partido, Prediccion } from "@/lib/tipos";

export interface ItemHistorial {
  partido: Partido;
  pred: Prediccion | null;
  puntos: number;
  jornada: number;
  horaPartido: string;
}

type Vista = "general" | "jornada";

function Jornada({ jornada, items }: { jornada: number; items: ItemHistorial[] }) {
  return (
    <div>
      <h2 className="mt-5 flex items-baseline justify-between border-b-2 border-forest-900 pb-1 font-display text-2xl first:mt-0">
        <span>Jornada {jornada}</span>
        <span className="font-sans text-sm text-muted">
          {rangoFechas(items.map((h) => h.horaPartido))} · {items.reduce((suma, h) => suma + h.puntos, 0)} pts
        </span>
      </h2>
      {items.map(({ pred, partido, puntos }) => (
        <div key={partido.id} className="fila">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted first-letter:uppercase">{formatearCorto(partido.horaPartido)}</span>
            <span className="uppercase tracking-widest text-muted">
              +{puntos} {puntos === 1 ? "punto" : "puntos"}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Equipo nombre={partido.local} className="flex-col text-center" claseEscudo="h-10 w-10" claseNombre="text-base" />
            <span className="font-display text-4xl">
              {partido.resultadoLocal} - {partido.resultadoVisitante}
            </span>
            <Equipo nombre={partido.visitante} className="flex-col text-center" claseEscudo="h-10 w-10" claseNombre="text-base" />
          </div>
          <p className="mt-2 text-center text-sm text-muted">
            {pred ? `Tu pronóstico: ${pred.local} - ${pred.visitante}` : "Sin pronóstico"}
          </p>
        </div>
      ))}
    </div>
  );
}

export function HistorialTabs({ historial, nombre }: { historial: ItemHistorial[]; nombre: string }) {
  const grupos = agruparPorJornada(historial); // más reciente primero
  const [vista, setVista] = useState<Vista>("general");
  // Por defecto, la jornada más reciente.
  const [jornada, setJornada] = useState(grupos[0]?.[0] ?? 1);

  const total = historial.reduce((suma, h) => suma + h.puntos, 0);
  const itemsJornada = historial.filter((h) => h.jornada === jornada);
  const totalJornada = itemsJornada.reduce((suma, h) => suma + h.puntos, 0);

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
      <p className="text-sm uppercase tracking-widest text-cream/60">Historial de</p>
      <h1 className="text-5xl text-gold-400">{nombre}</h1>
      <p className="mb-5 mt-2 text-cream/70">
        {vista === "general" ? (
          <>
            Llevas <strong className="font-display text-2xl text-gold-400">{total}</strong> puntos en total.
          </>
        ) : (
          <>
            Llevas <strong className="font-display text-2xl text-gold-400">{totalJornada}</strong> puntos en la jornada {jornada}.
          </>
        )}{" "}
        Aquí ves tus propios pronósticos; la tabla de todos está en Posiciones.
      </p>

      <div className="mb-4 flex gap-2">
        {botonVista("general", "General")}
        {botonVista("jornada", "Por jornada")}
      </div>

      {vista === "jornada" && grupos.length > 0 && (
        <nav aria-label="Jornadas" className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-2">
          {[...grupos].reverse().map(([j]) => (
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

      <section className="ticket" aria-label={vista === "general" ? "Tu historial general" : `Tu historial de la jornada ${jornada}`}>
        {grupos.length === 0 && <p className="text-muted">Todavía no hay partidos con resultado.</p>}
        {vista === "general"
          ? grupos.map(([j, items]) => <Jornada key={j} jornada={j} items={items} />)
          : grupos.length > 0 && <Jornada jornada={jornada} items={itemsJornada} />}
      </section>
    </div>
  );
}
