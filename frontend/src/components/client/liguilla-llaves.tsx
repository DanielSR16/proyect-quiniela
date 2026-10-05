import { Equipo as EquipoVista } from "@/components/client/equipo";
import { armarLlaves, type Equipo, type Serie } from "@/lib/liguilla";
import type { Partido } from "@/lib/tipos";

function Lado({ equipo, ganador, goles }: { equipo: Equipo; ganador: boolean; goles?: number }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-1.5 ${ganador ? "font-bold" : ""}`}>
      <EquipoVista nombre={equipo.nombre} claseEscudo="h-7 w-7" claseNombre="truncate text-base" />
      <span className={`font-display text-2xl ${ganador ? "" : "text-muted"}`}>{goles ?? "–"}</span>
    </div>
  );
}

function TarjetaSerie({ serie, esFinal }: { serie: Serie; esFinal: boolean }) {
  const { a, b, ida, vuelta, global, ganador } = serie;
  const empatada = !!global && !ganador;
  return (
    <div className="fila !py-3">
      <Lado equipo={a} ganador={ganador?.id === a.id} goles={global?.a} />
      <Lado equipo={b} ganador={ganador?.id === b.id} goles={global?.b} />
      <p className="mt-1 text-xs uppercase tracking-widest text-muted">
        Ida {ida ? `${ida.a} - ${ida.b}` : "–"} · Vuelta {vuelta ? `${vuelta.a} - ${vuelta.b}` : "–"}
        {empatada && ` · Global empatado${esFinal ? ": prórroga y penales" : ""}`}
      </p>
    </div>
  );
}

export function LiguillaLlaves({ partidos }: { partidos: Partido[] }) {
  const fases = armarLlaves(partidos);
  const campeon = fases[2].series[0]?.ganador;

  if (fases.every((f) => f.series.length === 0)) {
    return (
      <p className="text-cream/70">
        Todavía no hay partidos de liguilla. Cuando el administrador agregue los de Cuartos, Semifinal y Final, las llaves aparecen aquí.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {campeon && <p className="text-center font-display text-3xl text-gold-400">Campeón: {campeon.nombre}</p>}
      {fases.map((f, i) =>
        f.series.length === 0 ? null : (
          <section key={f.nombre} className="ticket" aria-label={f.nombre}>
            <h2 className="etiqueta !font-sans">{f.nombre}</h2>
            {f.series.map((s) => <TarjetaSerie key={`${s.a.id}-${s.b.id}`} serie={s} esFinal={i === 2} />)}
          </section>
        ),
      )}
    </div>
  );
}
