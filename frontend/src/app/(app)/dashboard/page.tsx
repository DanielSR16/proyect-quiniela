import { Equipo } from "@/components/client/equipo";
import { agruparPorJornada, formatearCorto } from "@/lib/formato";
import { exigirSesion } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { aPartido, aPrediccion } from "@/lib/tipos";

export default async function DashboardPage() {
  const sesion = await exigirSesion();
  const supabase = await createClient();

  const [partidos, predicciones] = await Promise.all([
    supabase.from("matches").select("*").not("home_score", "is", null),
    supabase.from("predictions").select("match_id, home_goals, away_goals, points").eq("user_id", sesion.id),
  ]);
  if (partidos.error) throw new Error(partidos.error.message);
  if (predicciones.error) throw new Error(predicciones.error.message);

  const misPredicciones = predicciones.data.map(aPrediccion);
  // Todos los partidos ya jugados; los que no pronosticaste cuentan 0 puntos.
  const historial = partidos.data.map(aPartido).map((partido) => {
    const pred = misPredicciones.find((p) => p.partidoId === partido.id) ?? null;
    return {
      pred,
      partido,
      real: { local: partido.resultadoLocal!, visitante: partido.resultadoVisitante! },
      puntos: pred?.puntos ?? 0,
      jornada: partido.jornada,
      horaPartido: partido.horaPartido,
    };
  });

  const grupos = agruparPorJornada(historial);
  const total = historial.reduce((suma, h) => suma + h.puntos, 0);

  return (
    <div>
      <h1 className="text-5xl text-gold-400">Historial</h1>
      <p className="mb-8 mt-2 text-cream/70">
        Llevas <strong className="font-display text-2xl text-gold-400">{total}</strong> puntos en total.
      </p>

      <section className="ticket" aria-label="Partidos jugados">
        {grupos.length === 0 && <p className="text-muted">Todavía no hay partidos con resultado.</p>}
        {grupos.map(([jornada, items]) => (
          <div key={jornada}>
            <h2 className="mt-5 flex items-baseline justify-between border-b-2 border-forest-900 pb-1 font-display text-2xl first:mt-0">
              <span>Jornada {jornada}</span>
              <span className="font-sans text-sm text-muted">
                {items.reduce((suma, h) => suma + h.puntos, 0)} pts
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
                  <span className="font-display text-4xl">{real.local} - {real.visitante}</span>
                  <Equipo nombre={partido.visitante} className="flex-col text-center" claseEscudo="h-10 w-10" claseNombre="text-base" />
                </div>
                <p className="mt-2 text-center text-sm text-muted">
                  {pred ? `Tu pronóstico: ${pred.local} - ${pred.visitante}` : "Sin pronóstico"}
                </p>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
