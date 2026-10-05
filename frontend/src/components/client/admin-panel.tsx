"use client";

import { useState } from "react";
import { Escudo } from "@/components/client/equipo";
import { agruparPorJornada, equipos, formatearCorto, partidos as iniciales, type Partido } from "@/lib/mock-data";

const JORNADAS = Array.from({ length: 30 }, (_, i) => i + 1);

function SelectorEquipo({
  id,
  etiqueta,
  valor,
  excluir,
  onChange,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  excluir: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-bold">{etiqueta}</label>
      <select id={id} required value={valor} onChange={(e) => onChange(e.target.value)} className="campo">
        <option value="" disabled>Selecciona un equipo</option>
        {equipos.map((e) => (
          <option key={e} value={e} disabled={e === excluir}>{e}</option>
        ))}
      </select>
    </div>
  );
}

function FormularioPartido({
  idBase,
  inicial,
  textoEnvio,
  onEnviar,
  onCancelar,
}: {
  idBase: string;
  inicial?: { local: string; visitante: string; hora: string; jornada: number };
  textoEnvio: string;
  onEnviar: (d: { local: string; visitante: string; hora: string; jornada: number }) => void;
  onCancelar?: () => void;
}) {
  const [local, setLocal] = useState(inicial?.local ?? "");
  const [visitante, setVisitante] = useState(inicial?.visitante ?? "");
  const [hora, setHora] = useState(inicial?.hora ?? "");
  const [jornada, setJornada] = useState(inicial ? String(inicial.jornada) : "");

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar({ local, visitante, hora, jornada: Number(jornada) });
        if (!inicial) {
          setLocal("");
          setVisitante("");
          setHora("");
        }
      }}
    >
      <SelectorEquipo id={`${idBase}-local`} etiqueta="Equipo local" valor={local} excluir={visitante} onChange={setLocal} />
      <SelectorEquipo id={`${idBase}-visitante`} etiqueta="Equipo visitante" valor={visitante} excluir={local} onChange={setVisitante} />
      <div>
        <label htmlFor={`${idBase}-jornada`} className="mb-1.5 block font-bold">Jornada</label>
        <select id={`${idBase}-jornada`} required value={jornada} onChange={(e) => setJornada(e.target.value)} className="campo">
          <option value="" disabled>Selecciona una jornada</option>
          {JORNADAS.map((j) => (
            <option key={j} value={j}>Jornada {j}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${idBase}-hora`} className="mb-1.5 block font-bold">
          Hora (cierra los pronósticos)
        </label>
        <input
          id={`${idBase}-hora`}
          type="datetime-local"
          required
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="campo"
        />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
        <button type="submit" className="boton sm:flex-1">{textoEnvio}</button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="boton !bg-transparent !text-tinta border-2 border-trazo hover:!border-forest-900">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export function AdminPanel() {
  const [lista, setLista] = useState<Partido[]>(iniciales);
  const [editando, setEditando] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const grupos = agruparPorJornada(lista);

  const agregar = (d: { local: string; visitante: string; hora: string; jornada: number }) =>
    setLista((l) => [
      ...l,
      { id: Math.max(0, ...l.map((p) => p.id)) + 1, local: d.local, visitante: d.visitante, jornada: d.jornada, horaPartido: d.hora, resultadoLocal: null, resultadoVisitante: null },
    ]);

  const actualizar = (id: number, d: { local: string; visitante: string; hora: string; jornada: number }) => {
    setLista((l) => l.map((p) => (p.id === id ? { ...p, local: d.local, visitante: d.visitante, jornada: d.jornada, horaPartido: d.hora } : p)));
    setEditando(null);
  };

  const eliminar = (id: number) => {
    setLista((l) => l.filter((p) => p.id !== id));
    setEliminando(null);
  };

  return (
    <>
      <section className="ticket" aria-labelledby="nuevo">
        <h2 id="nuevo" className="etiqueta !font-sans mb-4">Agregar partido</h2>
        <FormularioPartido idBase="nuevo" textoEnvio="Agregar partido" onEnviar={agregar} />
      </section>

      <section className="ticket" aria-labelledby="lista">
        <h2 id="lista" className="etiqueta !font-sans">Partidos y resultados</h2>
        {lista.length === 0 && <p className="fila text-muted">No hay partidos.</p>}
        {grupos.map(([jornada, partidosJornada]) => (
          <div key={jornada}>
            <h3 className="mt-5 border-b-2 border-forest-900 pb-1 font-display text-2xl">Jornada {jornada}</h3>
            {partidosJornada.map((p) =>
          editando === p.id ? (
            <div key={p.id} className="fila">
              <p className="etiqueta !font-sans mb-3">Editando partido</p>
              <FormularioPartido
                idBase={`editar-${p.id}`}
                inicial={{ local: p.local, visitante: p.visitante, hora: p.horaPartido.slice(0, 16), jornada: p.jornada }}
                textoEnvio="Guardar cambios"
                onEnviar={(d) => actualizar(p.id, d)}
                onCancelar={() => setEditando(null)}
              />
            </div>
          ) : (
            <div key={p.id} className="fila flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-bold"><Escudo nombre={p.local} className="h-7 w-7" /> {p.local} <span className="font-normal text-muted">vs</span> <Escudo nombre={p.visitante} className="h-7 w-7" /> {p.visitante}</p>
                  <p className="text-sm text-muted first-letter:uppercase">{formatearCorto(p.horaPartido)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input aria-label={`Goles ${p.local}`} type="number" min={0} defaultValue={p.resultadoLocal ?? ""} className="campo !w-16 text-center font-display text-2xl" />
                  <span className="font-bold">-</span>
                  <input aria-label={`Goles ${p.visitante}`} type="number" min={0} defaultValue={p.resultadoVisitante ?? ""} className="campo !w-16 text-center font-display text-2xl" />
                  <button type="button" className="boton">Guardar</button>
                </div>
              </div>

              {eliminando === p.id ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-bold text-error">¿Eliminar este partido?</span>
                  <button type="button" onClick={() => eliminar(p.id)} className="boton !bg-error !py-1.5 !text-sm">Sí, eliminar</button>
                  <button type="button" onClick={() => setEliminando(null)} className="underline underline-offset-4">Cancelar</button>
                </div>
              ) : (
                <div className="flex gap-4 text-sm">
                  <button type="button" onClick={() => { setEditando(p.id); setEliminando(null); }} className="underline underline-offset-4 hover:text-forest-700">
                    Editar partido
                  </button>
                  <button type="button" onClick={() => { setEliminando(p.id); setEditando(null); }} className="text-error underline underline-offset-4">
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ),
            )}
          </div>
        ))}
      </section>
    </>
  );
}
