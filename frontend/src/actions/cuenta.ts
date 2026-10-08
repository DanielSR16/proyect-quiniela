"use server";

import { createClient as createClientSinSesion } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSesion } from "@/lib/sesion";
import type { Resultado } from "@/lib/tipos";

// Cambia la contraseña del usuario que tiene la sesión abierta. Pide la actual para evitar que
// alguien con el celular desbloqueado la cambie.
export async function cambiarPassword(actual: string, nueva: string): Promise<Resultado> {
  if (!(await getSesion())) redirect("/auth/signout");
  if (nueva.length < 8) return { ok: false, error: "La contraseña nueva debe tener al menos 8 caracteres" };
  if (nueva.length > 72) return { ok: false, error: "La contraseña nueva es demasiado larga" };
  if (nueva === actual) return { ok: false, error: "La contraseña nueva debe ser distinta de la actual" };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  const correo = data?.claims?.email;
  if (!id || !correo) redirect("/auth/signout");

  // Comprueba la contraseña actual con un cliente sin cookies, para no crear otra sesión.
  const verificador = createClientSinSesion(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error: claveMala } = await verificador.auth.signInWithPassword({ email: correo, password: actual });
  if (claveMala) return { ok: false, error: "La contraseña actual no es correcta" };
  await verificador.auth.signOut({ scope: "local" });

  const { error } = await createAdminClient().auth.admin.updateUserById(id, { password: nueva });
  if (error) return { ok: false, error: "No se pudo cambiar la contraseña. Intenta de nuevo" };
  return { ok: true };
}
