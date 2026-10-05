import { TorneosPanel } from "@/components/client/torneos-panel";
import { exigirAdmin } from "@/lib/sesion";
import { cargarTorneos } from "@/lib/torneos";

export default async function TorneosPage() {
  await exigirAdmin();
  const { torneos } = await cargarTorneos();
  return <TorneosPanel torneos={torneos} />;
}
