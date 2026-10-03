"use client";

import { useState } from "react";

function Contador({
  equipo,
  valor,
  onChange,
}: {
  equipo: string;
  valor: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <span className="text-center text-xl font-bold">{equipo}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Quitar un gol a ${equipo}`}
          onClick={() => onChange(Math.max(0, valor - 1))}
          className="h-14 w-14 rounded-md bg-line text-3xl font-bold hover:bg-primary-100"
        >
          −
        </button>
        <span className="w-12 text-center text-5xl font-bold">{valor}</span>
        <button
          type="button"
          aria-label={`Agregar un gol a ${equipo}`}
          onClick={() => onChange(Math.min(20, valor + 1))}
          className="h-14 w-14 rounded-md bg-primary-600 text-3xl font-bold text-white hover:bg-primary-700"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function Predictor({
  local,
  visitante,
  inicial,
}: {
  local: string;
  visitante: string;
  inicial?: { local: number; visitante: number };
}) {
  const [golesLocal, setGolesLocal] = useState(inicial?.local ?? 0);
  const [golesVisitante, setGolesVisitante] = useState(inicial?.visitante ?? 0);
  const [guardado, setGuardado] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <Contador equipo={local} valor={golesLocal} onChange={(v) => { setGolesLocal(v); setGuardado(false); }} />
        <span className="pt-10 text-2xl font-bold text-ink/70">vs</span>
        <Contador equipo={visitante} valor={golesVisitante} onChange={(v) => { setGolesVisitante(v); setGuardado(false); }} />
      </div>
      <button
        type="button"
        onClick={() => setGuardado(true)}
        className="w-full rounded-md bg-primary-600 px-6 py-4 text-xl font-bold text-white hover:bg-primary-700"
      >
        {guardado ? "✓ Predicción guardada" : "Guardar mi predicción"}
      </button>
    </div>
  );
}
