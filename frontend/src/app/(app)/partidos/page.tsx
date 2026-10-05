import { PartidosPorJornada } from "@/components/client/partidos-por-jornada";
import { exigirSesion } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { aPartido, aPrediccion } from "@/lib/tipos";

export default async function PartidosPage() {
  const sesion = await exigirSesion();
  const supabase = await createClient();

  const [partidos, predicciones] = await Promise.all([
    supabase.from("matches").select("*").order("kickoff_at"),
    supabase.from("predictions").select("match_id, home_goals, away_goals, points").eq("user_id", sesion.id),
  ]);
  if (partidos.error) throw new Error(partidos.error.message);
  if (predicciones.error) throw new Error(predicciones.error.message);

  return (
    <PartidosPorJornada partidos={partidos.data.map(aPartido)} misPredicciones={predicciones.data.map(aPrediccion)} />
  );
}
