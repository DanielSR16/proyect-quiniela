import { AdminPanel } from "@/components/client/admin-panel";
import { exigirAdmin } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import { aPartido } from "@/lib/tipos";

export default async function AdminPage() {
  await exigirAdmin();  // el layout también lo comprueba, pero cada página debe protegerse sola
  const supabase = await createClient();
  const { data, error } = await supabase.from("matches").select("*").order("kickoff_at");
  if (error) throw new Error(error.message);

  return <AdminPanel partidos={data.map(aPartido)} />;
}
