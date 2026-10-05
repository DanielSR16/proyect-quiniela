import { RankingTabs } from "@/components/client/ranking-tabs";
import { exigirSesion } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { aPartido, aPrediccion } from "@/lib/tipos";

export default async function RankingPage() {
  await exigirSesion();
  const supabase = await createClient();

  // RLS solo deja ver los pronósticos ajenos de partidos ya cerrados, que son los únicos con puntos.
  const [perfiles, partidos, predicciones] = await Promise.all([
    supabase.from("profiles").select("id, name"),
    supabase.from("matches").select("*"),
    supabase.from("predictions").select("user_id, match_id, home_goals, away_goals, points").not("points", "is", null),
  ]);
  if (perfiles.error) throw new Error(perfiles.error.message);
  if (partidos.error) throw new Error(partidos.error.message);
  if (predicciones.error) throw new Error(predicciones.error.message);

  return (
    <RankingTabs
      jugadores={perfiles.data.map((p) => ({ id: p.id, nombre: p.name }))}
      partidos={partidos.data.map(aPartido)}
      predicciones={predicciones.data.map((p) => ({ ...aPrediccion(p), jugadorId: p.user_id }))}
    />
  );
}
