"use client";

import { useState, useTransition } from "react";
import { activarTorneo, crearTorneo } from "@/actions/torneos";
import type { Resultado } from "@/lib/tipos";
import type { Torneo } from "@/lib/torneos";

export function TorneosPanel({ torneos }: { torneos: Torneo[] }) {
  const [tipo, setTipo] = useState<"apertura" | "clausura">("apertura");
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [enviando, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const accion = (fn: () => Promise<Resultado>) =>
    iniciar(async () => {
      const r = await fn();
      setError(r.ok ? null : r.error);
    });

  return (
    <>
      <section className="ticket" aria-labelledby="nuevo-torneo">
        <h2 id="nuevo-torneo" className="etiqueta !font-sans mb-4">Nuevo torneo</h2>
        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            accion(() => crearTorneo({ tipo, anio: Number(anio) }));
          }}
        >
          <div>
            <label htmlFor="torneo-tipo" className="mb-1.5 block font-bold">Torneo</label>
            <select id="torneo-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)} className="campo">
              <option value="apertura">Apertura</option>
              <option value="clausura">Clausura</option>
            </select>
          </div>
          <div>
            <label htmlFor="torneo-anio" className="mb-1.5 block font-bold">Año</label>
            <input id="torneo-anio" type="number" required min={2000} max={2100} value={anio} onChange={(e) => setAnio(e.target.value)} className="campo" />
          </div>
          <button type="submit" disabled={enviando} className="boton disabled:opacity-60 sm:col-span-2">
            {enviando ? "Guardando…" : "Crear torneo"}
          </button>
        </form>
        {error && <p role="alert" className="mt-3 font-bold text-error">{error}</p>}
      </section>

      <section className="ticket" aria-labelledby="lista-torneos">
        <h2 id="lista-torneos" className="etiqueta !font-sans">Torneos</h2>
        <p className="mb-2 text-sm text-muted">El torneo activo es el que ven por defecto los jugadores.</p>
        {torneos.map((t) => (
          <div key={t.id} className="fila flex items-center justify-between gap-3">
            <span className="text-lg font-bold">{t.nombre}</span>
            {t.activo ? (
              <span className="text-sm font-bold uppercase tracking-widest text-forest-700">Activo</span>
            ) : (
              <button type="button" disabled={enviando} onClick={() => accion(() => activarTorneo(t.id))} className="text-sm underline underline-offset-4 disabled:opacity-60">
                Marcar como activo
              </button>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
