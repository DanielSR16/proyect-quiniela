"use client";

import { useEffect, useState } from "react";
import { Equipo } from "@/components/client/equipo";

function Contador({
  equipo,
  valor,
  onChange,
  bloqueado,
}: {
  equipo: string;
  valor: number | null;
  onChange: (v: number) => void;
  bloqueado: boolean;
}) {
  const boton =
    "h-8 w-8 shrink-0 rounded-sm border-2 border-trazo text-base md:h-11 md:w-11 md:text-xl font-bold leading-none hover:border-forest-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-trazo";
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`Quitar un gol a ${equipo}`}
        disabled={bloqueado}
        onClick={() => onChange(Math.max(0, (valor ?? 0) - 1))}
        className={boton}
      >
        −
      </button>
      <span
        aria-live="polite"
        className="flex h-8 w-9 items-center justify-center border-2 border-dashed border-trazo font-display text-xl md:h-11 md:w-12 md:text-3xl"
      >
        {valor ?? "-"}
      </span>
      <button
        type="button"
        aria-label={`Agregar un gol a ${equipo}`}
        disabled={bloqueado}
        onClick={() => onChange(Math.min(20, (valor ?? 0) + 1))}
        className={boton}
      >
        +
      </button>
    </div>
  );
}

export function Predictor({
  local,
  visitante,
  hora,
  inicio,
  inicial,
}: {
  local: string;
  visitante: string;
  hora: string;
  inicio: string;
  inicial?: { local: number; visitante: number };
}) {
  const [golesLocal, setGolesLocal] = useState<number | null>(inicial?.local ?? null);
  const [golesVisitante, setGolesVisitante] = useState<number | null>(inicial?.visitante ?? null);
  const [estado, setEstado] = useState<"sin" | "guardado" | "editado">(inicial ? "guardado" : "sin");

  const [cerrado, setCerrado] = useState(false);
  useEffect(() => {
    const revisar = () => setCerrado(Date.now() >= new Date(inicio).getTime());
    revisar();
    const t = setInterval(revisar, 15000);
    return () => clearInterval(t);
  }, [inicio]);

  const completo = golesLocal !== null && golesVisitante !== null;
  const etiqueta = { sin: "Sin pronóstico", guardado: "Pronóstico guardado", editado: "Sin guardar" }[estado];

  return (
    <div className="fila">
      <div className="flex items-baseline justify-between gap-3 text-xs md:text-sm">
        <span className="text-muted first-letter:uppercase">{hora}</span>
        <span className="uppercase tracking-widest text-muted">{cerrado ? "Pronóstico cerrado" : etiqueta}</span>
      </div>

      {/* Móvil: un equipo por renglón. Tablet/PC: local – visitante en una sola fila */}
      <div className="mt-2 flex flex-col gap-2 md:mt-3 md:grid md:grid-cols-[1fr_auto_auto_auto_1fr] md:items-center md:gap-4">
        <div className="flex items-center justify-between gap-3 md:contents">
          <Equipo nombre={local} claseNombre="text-base md:text-lg" claseEscudo="h-8 w-8 md:h-10 md:w-10" />
          <Contador bloqueado={cerrado} equipo={local} valor={golesLocal} onChange={(v) => { setGolesLocal(v); setEstado("editado"); }} />
        </div>
        <span className="hidden font-bold text-muted md:block">–</span>
        <div className="flex items-center justify-between gap-3 md:contents">
          <Equipo nombre={visitante} className="md:order-last md:flex-row-reverse md:justify-end md:text-right" claseNombre="text-base md:text-lg" claseEscudo="h-8 w-8 md:h-10 md:w-10" />
          <Contador bloqueado={cerrado} equipo={visitante} valor={golesVisitante} onChange={(v) => { setGolesVisitante(v); setEstado("editado"); }} />
        </div>
      </div>

      <button
        type="button"
        disabled={cerrado || !completo || estado === "guardado"}
        onClick={() => setEstado("guardado")}
        className="boton mt-3 w-full md:mt-4 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-forest-900"
      >
        {cerrado ? "Cerrado: el partido ya inició" : estado === "guardado" ? "Guardado" : "Guardar pronóstico"}
      </button>
    </div>
  );
}
