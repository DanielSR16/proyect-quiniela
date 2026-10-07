"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface EstadoLogin {
  error?: string;
  correo?: string; // se devuelve para no obligar a reescribirlo tras un error
}

export async function iniciarSesion(_previo: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const correo = String(formData.get("correo") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!correo || !password) return { error: "Escribe tu correo y tu contraseña", correo };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
  if (error) {
    if (error.code === "user_banned") return { error: "Tu cuenta está bloqueada. Habla con el administrador", correo };
    return { error: "Correo o contraseña incorrectos", correo };
  }

  // Un usuario bloqueado no puede leer su perfil (RLS): sin perfil visible, no entra.
  const { data: perfil } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
  if (!perfil) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta está bloqueada. Habla con el administrador", correo };
  }

  // Sesión única: cierra las sesiones del mismo usuario en otros dispositivos.
  // La base de datos rechaza al instante los tokens de sesiones revocadas (ver private.is_active()).
  await createAdminClient().auth.admin.signOut(data.session.access_token, "others");

  redirect("/partidos");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
