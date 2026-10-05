import { RankingTabs } from "@/components/client/ranking-tabs";
import { SelectorTorneo } from "@/components/client/selector-torneo";
import { exigirSesion } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { cargarTorneos } from "@/lib/torneos";
import { PARTIDO_SELECT, aPartido, aPrediccion } from "@/lib/tipos";

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ torneo?: string }> }) {
  await exigirSesion();
  const supabase = await createClient();
  const { torneos, actual } = await cargarTorneos((await searchParams).torneo);
  if (!actual) return <p className="text-cream/70">Todavía no hay torneos.</p>;

  // RLS solo deja ver los pronósticos ajenos de partidos ya cerrados, que son los únicos con puntos.
  // Los pronósticos de otros torneos no suman: el ranking solo cuenta los partidos de este torneo.
  const [perfiles, partidos, predicciones] = await Promise.all([
    supabase.from("profiles").select("id, name"),
    supabase.from("matches").select(PARTIDO_SELECT).eq("tournament_id", actual.id),
    supabase.from("predictions").select("user_id, match_id, home_goals, away_goals, points").not("points", "is", null),
  ]);
  if (perfiles.error) throw new Error(perfiles.error.message);
  if (partidos.error) throw new Error(partidos.error.message);
  if (predicciones.error) throw new Error(predicciones.error.message);

  return (
    <>
      <SelectorTorneo torneos={torneos} actual={actual} />
      <RankingTabs
        key={actual.id}
        jugadores={perfiles.data.map((p) => ({ id: p.id, nombre: p.name }))}
        partidos={partidos.data.map(aPartido)}
        predicciones={predicciones.data.map((p) => ({ ...aPrediccion(p), jugadorId: p.user_id }))}
      />
    </>
  );
}
