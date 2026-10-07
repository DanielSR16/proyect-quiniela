"use client";

import { useEffect, useState, useTransition } from "react";
import { actualizarPartido, cambiarEstadoJornada, crearPartido, eliminarPartido, guardarResultado } from "@/actions/partidos";
import { Escudo } from "@/components/client/equipo";
import { TOTAL_JORNADAS, esLiguilla, etiquetaCorta, nombreJornada } from "@/lib/jornadas";
import { agruparPorJornada, aInputLocal, desdeInputLocal, formatearCorto, rangoFechas } from "@/lib/formato";
import type { Partido } from "@/lib/tipos";

export interface OpcionEquipo {
  id: number;
  name: string;
}

interface DatosForm {
  localId: string; // id del equipo, como valor de <select>
  visitanteId: string;
  hora: string; // valor de datetime-local (hora de México)
  jornada: number;
}

// Devuelve un mensaje de error, o null si todo salió bien.
type Envio = (d: DatosForm) => Promise<string | null>;

const JORNADAS = Array.from({ length: TOTAL_JORNADAS }, (_, i) => i + 1);

function SelectorEquipo({
  id,
  etiqueta,
  equipos,
  valor,
  excluir,
  onChange,
}: {
  id: string;
  etiqueta: string;
  equipos: OpcionEquipo[];
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
          <option key={e.id} value={String(e.id)} disabled={String(e.id) === excluir}>{e.name}</option>
        ))}
      </select>
    </div>
  );
}

function FormularioPartido({
  idBase,
  equipos,
  jornadasTerminadas,
  inicial,
  textoEnvio,
  onEnviar,
  onCancelar,
}: {
  idBase: string;
  equipos: OpcionEquipo[];
  jornadasTerminadas: number[];
  inicial?: DatosForm;
  textoEnvio: string;
  onEnviar: Envio;
  onCancelar?: () => void;
}) {
  const [enviando, iniciarEnvio] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  useEffect(() => {
    if (!exito) return;
    const t = setTimeout(() => setExito(null), 4000);
    return () => clearTimeout(t);
  }, [exito]);
  // La hora mínima es "ahora". Se calcula tras montar para no desajustar el HTML del servidor.
  // Si el partido que se edita ya empezó, no se pone mínimo para poder guardar otros cambios con su hora
  // actual; el servidor igual rechaza cambiarla a una hora pasada.
  const [minimo, setMinimo] = useState<string | undefined>();
  useEffect(() => {
    const ahora = aInputLocal(new Date().toISOString());
    if (!inicial || inicial.hora >= ahora) setMinimo(ahora);
  }, [inicial]);
  const [local, setLocal] = useState(inicial?.localId ?? "");
  const [visitante, setVisitante] = useState(inicial?.visitanteId ?? "");
  const [hora, setHora] = useState(inicial?.hora ?? "");
  const [elegida, setJornada] = useState(inicial ? String(inicial.jornada) : "");
  // Al agregar, la jornada queda predefinida en la primera que sigue activa (si 1-9 están terminadas, la 10).
  // Si lo elegido se termina mientras tanto, vuelve a la predefinida. Al editar se respeta la jornada del partido.
  const predefinida = JORNADAS.find((j) => !jornadasTerminadas.includes(j));
  const jornada =
    inicial || (elegida !== "" && !jornadasTerminadas.includes(Number(elegida)))
      ? elegida
      : predefinida === undefined ? "" : String(predefinida);

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        iniciarEnvio(async () => {
          const fallo = await onEnviar({ localId: local, visitanteId: visitante, hora, jornada: Number(jornada) });
          setError(fallo);
          setExito(null);
          if (!fallo && !inicial) {
            setExito("Partido agregado");
            setLocal("");
            setVisitante("");
            setHora("");
          }
        });
      }}
    >
      <SelectorEquipo id={`${idBase}-local`} equipos={equipos} etiqueta="Equipo local" valor={local} excluir={visitante} onChange={setLocal} />
      <SelectorEquipo id={`${idBase}-visitante`} equipos={equipos} etiqueta="Equipo visitante" valor={visitante} excluir={local} onChange={setVisitante} />
      <div>
        <label htmlFor={`${idBase}-jornada`} className="mb-1.5 block font-bold">Jornada</label>
        <select id={`${idBase}-jornada`} required value={jornada} onChange={(e) => setJornada(e.target.value)} className="campo">
          <option value="" disabled>Selecciona una jornada</option>
          {JORNADAS.map((j) => (
            <option key={j} value={j} disabled={jornadasTerminadas.includes(j) && j !== inicial?.jornada}>
              {nombreJornada(j)}{jornadasTerminadas.includes(j) ? " (terminada)" : ""}
            </option>
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
          min={minimo}
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="campo"
        />
      </div>
      {error && <p role="alert" className="font-bold text-error sm:col-span-2">{error}</p>}
      {exito && <p role="status" className="font-bold text-forest-700 sm:col-span-2">{exito}</p>}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
        <button type="submit" disabled={enviando} className="boton disabled:opacity-60 sm:flex-1">
          {enviando ? "Guardando…" : textoEnvio}
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="boton !bg-transparent !text-tinta border-2 border-trazo hover:!border-forest-900">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

function ControlJornadas({ torneoId, terminadas, partidos }: { torneoId: number; terminadas: number[]; partidos: Partido[] }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const cambiar = (numero: number, terminada: boolean) =>
    iniciar(async () => {
      const r = await cambiarEstadoJornada(torneoId, numero, terminada);
      setError(r.ok ? null : r.error);
    });

  return (
    <details className="ticket group" aria-labelledby="jornadas">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <h2 id="jornadas" className="etiqueta !font-sans">
          Jornadas
          {terminadas.length > 0 && (
            <span className="ml-2 font-normal normal-case tracking-normal text-muted">
              · {terminadas.length} {terminadas.length === 1 ? "terminada" : "terminadas"}
            </span>
          )}
        </h2>
        <span aria-hidden className="text-muted transition-transform group-open:rotate-180">▾</span>
      </summary>
      <p className="mb-4 mt-3 text-sm text-muted">
        Una jornada terminada no admite partidos nuevos hasta que la actives de nuevo.
      </p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {JORNADAS.map((j) => {
          const terminada = terminadas.includes(j);
          return (
            <li key={j}>
              <button
                type="button"
                disabled={pendiente}
                onClick={() => cambiar(j, !terminada)}
                aria-pressed={terminada}
                title={terminada ? "Terminada: toca para activarla" : "Activa: toca para marcarla como terminada"}
                className={`w-full rounded border-2 px-2 py-2 text-sm transition-colors disabled:opacity-60 ${
                  terminada ? "border-trazo bg-trazo/20 text-muted" : "border-forest-900 font-bold"
                }`}
              >
                <span className={`block font-display ${esLiguilla(j) ? "text-base leading-6" : "text-xl"}`}>{etiquetaCorta(j)}</span>
                <span className="block text-xs uppercase tracking-widest">{terminada ? "Terminada" : "Activa"}</span>
                <span className="block text-xs font-normal normal-case tracking-normal text-muted">
                  {rangoFechas(partidos.filter((p) => p.jornada === j).map((p) => p.horaPartido)) ?? "Sin partidos"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {error && <p role="alert" className="mt-3 font-bold text-error">{error}</p>}
    </details>
  );
}

function FilaResultado({ partido }: { partido: Partido }) {
  const [local, setLocal] = useState(partido.resultadoLocal === null ? "" : String(partido.resultadoLocal));
  const [visitante, setVisitante] = useState(partido.resultadoVisitante === null ? "" : String(partido.resultadoVisitante));
  const [guardando, iniciarGuardado] = useTransition();
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const guardar = () =>
    iniciarGuardado(async () => {
      if (local === "" || visitante === "") return setAviso({ ok: false, texto: "Escribe los goles de los dos equipos" });
      const r = await guardarResultado(partido.id, Number(local), Number(visitante));
      setAviso(r.ok ? { ok: true, texto: "Resultado guardado" } : { ok: false, texto: r.error });
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input aria-label={`Goles ${partido.local}`} type="number" min={0} max={99} value={local} onChange={(e) => { setLocal(e.target.value); setAviso(null); }} className="campo !w-16 text-center font-display text-2xl" />
        <span className="font-bold">-</span>
        <input aria-label={`Goles ${partido.visitante}`} type="number" min={0} max={99} value={visitante} onChange={(e) => { setVisitante(e.target.value); setAviso(null); }} className="campo !w-16 text-center font-display text-2xl" />
        <button type="button" onClick={guardar} disabled={guardando} className="boton disabled:opacity-60">
          {guardando ? "…" : "Guardar"}
        </button>
      </div>
      {aviso && <p role="status" className={`text-sm font-bold ${aviso.ok ? "text-forest-700" : "text-error"}`}>{aviso.texto}</p>}
    </div>
  );
}

export function AdminPanel({
  torneoId,
  torneoNombre,
  partidos,
  equipos,
  jornadasTerminadas,
}: {
  torneoId: number;
  torneoNombre: string;
  partidos: Partido[];
  equipos: OpcionEquipo[];
  jornadasTerminadas: number[];
}) {
  const [editando, setEditando] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [borrando, iniciarBorrado] = useTransition();
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  const grupos = agruparPorJornada(partidos);

  const aDatos = (d: DatosForm) => ({
    localId: Number(d.localId),
    visitanteId: Number(d.visitanteId),
    torneoId,
    jornada: d.jornada,
    horaPartido: desdeInputLocal(d.hora),
  });

  const agregar: Envio = async (d) => {
    const r = await crearPartido(aDatos(d));
    return r.ok ? null : r.error;
  };

  const actualizar = async (id: number, d: DatosForm) => {
    const r = await actualizarPartido(id, aDatos(d));
    if (r.ok) setEditando(null);
    return r.ok ? null : r.error;
  };

  const eliminar = (id: number) =>
    iniciarBorrado(async () => {
      const r = await eliminarPartido(id);
      if (r.ok) {
        setEliminando(null);
        setErrorBorrado(null);
      } else {
        setErrorBorrado(r.error);
      }
    });

  return (
    <>
      <section className="ticket" aria-labelledby="nuevo">
        <h2 id="nuevo" className="etiqueta !font-sans mb-4">Agregar partido · {torneoNombre}</h2>
        <FormularioPartido idBase="nuevo" equipos={equipos} jornadasTerminadas={jornadasTerminadas} textoEnvio="Agregar partido" onEnviar={agregar} />
      </section>

      <ControlJornadas torneoId={torneoId} terminadas={jornadasTerminadas} partidos={partidos} />

      <section className="ticket" aria-labelledby="lista">
        <h2 id="lista" className="etiqueta !font-sans">Partidos y resultados</h2>
        {partidos.length === 0 && <p className="fila text-muted">No hay partidos.</p>}
        {grupos.map(([jornada, partidosJornada]) => (
          <details key={jornada} className="group mt-3">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 border-b-2 border-forest-900 pb-1 [&::-webkit-details-marker]:hidden">
              <h3 className="font-display text-2xl">{nombreJornada(jornada)}</h3>
              <span className="flex items-baseline gap-3 font-sans text-sm text-muted">
                <span>
                  {rangoFechas(partidosJornada.map((p) => p.horaPartido))} · {partidosJornada.length}{" "}
                  {partidosJornada.length === 1 ? "partido" : "partidos"}
                </span>
                <span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
              </span>
            </summary>
            {partidosJornada.map((p) =>
          editando === p.id ? (
            <div key={p.id} className="fila">
              <p className="etiqueta !font-sans mb-3">Editando partido</p>
              <FormularioPartido
                idBase={`editar-${p.id}`}
                equipos={equipos}
                jornadasTerminadas={jornadasTerminadas}
                inicial={{ localId: String(p.localId), visitanteId: String(p.visitanteId), hora: aInputLocal(p.horaPartido), jornada: p.jornada }}
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
                <FilaResultado key={`${p.id}-${p.resultadoLocal}-${p.resultadoVisitante}`} partido={p} />
              </div>

              {eliminando === p.id ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-bold text-error">¿Eliminar este partido?</span>
                  <button type="button" onClick={() => eliminar(p.id)} disabled={borrando} className="boton !bg-error !py-1.5 !text-sm disabled:opacity-60">Sí, eliminar</button>
                  <button type="button" onClick={() => setEliminando(null)} className="underline underline-offset-4">Cancelar</button>
                  {errorBorrado && <span role="alert" className="font-bold text-error">{errorBorrado}</span>}
                </div>
              ) : (
                <div className="flex gap-4 text-sm">
                  <button type="button" onClick={() => { setEditando(p.id); setEliminando(null); }} className="underline underline-offset-4 hover:text-forest-700">
                    Editar partido
                  </button>
                  <button type="button" onClick={() => { setEliminando(p.id); setEditando(null); setErrorBorrado(null); }} className="text-error underline underline-offset-4">
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ),
            )}
          </details>
        ))}
      </section>
    </>
  );
}
