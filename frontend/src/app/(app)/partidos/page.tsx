import { PartidosPorJornada } from "@/components/client/partidos-por-jornada";
import { SelectorTorneo } from "@/components/client/selector-torneo";
import { exigirSesion } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { cargarTorneos } from "@/lib/torneos";
import { PARTIDO_SELECT, aPartido, aPrediccion } from "@/lib/tipos";

export default async function PartidosPage({ searchParams }: { searchParams: Promise<{ torneo?: string }> }) {
  const sesion = await exigirSesion();
  const supabase = await createClient();
  const { torneos, actual } = await cargarTorneos((await searchParams).torneo);
  if (!actual) return <p className="text-cream/70">Todavía no hay torneos.</p>;

  const [partidos, predicciones] = await Promise.all([
    supabase.from("matches").select(PARTIDO_SELECT).eq("tournament_id", actual.id).order("kickoff_at"),
    supabase.from("predictions").select("match_id, home_goals, away_goals, points").eq("user_id", sesion.id),
  ]);
  if (partidos.error) throw new Error(partidos.error.message);
  if (predicciones.error) throw new Error(predicciones.error.message);

  return (
    <>
      <SelectorTorneo torneos={torneos} actual={actual} />
      <PartidosPorJornada
        key={actual.id}
        partidos={partidos.data.map(aPartido)}
        misPredicciones={predicciones.data.map(aPrediccion)}
      />
    </>
  );
}
