import { UsuariosPanel } from "@/components/client/usuarios-panel";
import { exigirAdmin } from "@/lib/sesion";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Usuario } from "@/lib/tipos";

export default async function UsuariosPage() {
  await exigirAdmin();  // esta página usa la service_role: debe protegerse sola

  const admin = createAdminClient();
  const [perfiles, cuentas] = await Promise.all([
    admin.from("profiles").select("id, name, role, blocked"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  if (perfiles.error) throw new Error(perfiles.error.message);
  if (cuentas.error) throw new Error(cuentas.error.message);

  const correos = new Map(cuentas.data.users.map((u) => [u.id, u.email ?? ""]));
  const usuarios: Usuario[] = perfiles.data
    .map((p) => ({
      id: p.id,
      nombre: p.name,
      correo: correos.get(p.id) ?? "",
      rol: (p.role === "admin" ? "admin" : "player") as Usuario["rol"],
      bloqueado: p.blocked,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return <UsuariosPanel usuarios={usuarios} />;
}
