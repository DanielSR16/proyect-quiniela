import { Equipo } from "@/components/client/equipo";
import { agruparPorJornada, calcularPuntos, formatearCorto, misPredicciones, partidos } from "@/lib/mock-data";

export default function DashboardPage() {
  const historial = misPredicciones
    .map((pred) => {
      const partido = partidos.find((p) => p.id === pred.partidoId)!;
      const real =
        partido.resultadoLocal !== null && partido.resultadoVisitante !== null
          ? { local: partido.resultadoLocal, visitante: partido.resultadoVisitante }
          : null;
      return { pred, partido, real, puntos: real ? calcularPuntos(pred, real) : null };
    })
    .filter((h) => h.real);

  const grupos = agruparPorJornada(historial.map((h) => ({ ...h, jornada: h.partido.jornada, horaPartido: h.partido.horaPartido })));
  const total = historial.reduce((suma, h) => suma + (h.puntos ?? 0), 0);

  return (
    <div>
      <h1 className="text-5xl text-gold-400">Historial</h1>
      <p className="mb-8 mt-2 text-cream/70">
        Llevas <strong className="font-display text-2xl text-gold-400">{total}</strong> puntos en total.
      </p>

      <section className="ticket" aria-label="Partidos jugados">
        {grupos.map(([jornada, items]) => (
          <div key={jornada}>
            <h2 className="mt-5 flex items-baseline justify-between border-b-2 border-forest-900 pb-1 font-display text-2xl first:mt-0">
              <span>Jornada {jornada}</span>
              <span className="font-sans text-sm text-muted">
                {items.reduce((suma, h) => suma + (h.puntos ?? 0), 0)} pts
              </span>
            </h2>
            {items.map(({ pred, partido, real, puntos }) => (
          <div key={partido.id} className="fila">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted first-letter:uppercase">{formatearCorto(partido.horaPartido)}</span>
              <span className="uppercase tracking-widest text-muted">
                +{puntos} {puntos === 1 ? "punto" : "puntos"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <Equipo nombre={partido.local} className="flex-col text-center" claseEscudo="h-10 w-10" claseNombre="text-base" />
              <span className="font-display text-4xl">{real!.local} - {real!.visitante}</span>
              <Equipo nombre={partido.visitante} className="flex-col text-center" claseEscudo="h-10 w-10" claseNombre="text-base" />
            </div>
            <p className="mt-2 text-center text-sm text-muted">
              Tu pronóstico: {pred.local} - {pred.visitante}
            </p>
          </div>
        ))}
          </div>
        ))}
      </section>
    </div>
  );
}
