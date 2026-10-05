import { HistorialTabs } from "@/components/client/historial-tabs";
import { SelectorTorneo } from "@/components/client/selector-torneo";
import { exigirSesion } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { cargarTorneos } from "@/lib/torneos";
import { PARTIDO_SELECT, aPartido, aPrediccion } from "@/lib/tipos";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ torneo?: string }> }) {
  const sesion = await exigirSesion();
  const supabase = await createClient();
  const { torneos, actual } = await cargarTorneos((await searchParams).torneo);
  if (!actual) return <p className="text-cream/70">Todavía no hay torneos.</p>;

  const [partidos, predicciones] = await Promise.all([
    supabase.from("matches").select(PARTIDO_SELECT).eq("tournament_id", actual.id).not("home_score", "is", null),
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
      puntos: pred?.puntos ?? 0,
      jornada: partido.jornada,
      horaPartido: partido.horaPartido,
    };
  });

  return (
    <>
      <SelectorTorneo torneos={torneos} actual={actual} />
      <HistorialTabs key={actual.id} historial={historial} nombre={sesion.nombre} />
    </>
  );
}
