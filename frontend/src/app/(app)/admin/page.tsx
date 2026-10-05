import { AdminPanel } from "@/components/client/admin-panel";
import { SelectorTorneo } from "@/components/client/selector-torneo";
import { exigirAdmin } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { cargarTorneos } from "@/lib/torneos";
import { PARTIDO_SELECT, aPartido } from "@/lib/tipos";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ torneo?: string }> }) {
  await exigirAdmin();  // el layout también lo comprueba, pero cada página debe protegerse sola
  const supabase = await createClient();
  const { torneos, actual } = await cargarTorneos((await searchParams).torneo);
  if (!actual) return <p className="text-cream/70">Crea primero un torneo en la pestaña Torneos.</p>;

  const [partidos, equipos, jornadas] = await Promise.all([
    supabase.from("matches").select(PARTIDO_SELECT).eq("tournament_id", actual.id).order("kickoff_at"),
    supabase.from("teams").select("id, name").order("name"),
    supabase.from("rounds").select("number").eq("tournament_id", actual.id).eq("finished", true).order("number"),
  ]);
  if (partidos.error) throw new Error(partidos.error.message);
  if (equipos.error) throw new Error(equipos.error.message);
  if (jornadas.error) throw new Error(jornadas.error.message);

  return (
    <>
      <SelectorTorneo torneos={torneos} actual={actual} />
      <AdminPanel
        key={actual.id}
        torneoId={actual.id}
        torneoNombre={actual.nombre}
        partidos={partidos.data.map(aPartido)}
        equipos={equipos.data}
        jornadasTerminadas={jornadas.data.map((j) => j.number)}
      />
    </>
  );
}
