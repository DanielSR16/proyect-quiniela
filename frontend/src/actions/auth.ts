"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface EstadoLogin {
  error?: string;
}

export async function iniciarSesion(_previo: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const correo = String(formData.get("correo") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!correo || !password) return { error: "Escribe tu correo y tu contraseña" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
  if (error) {
    if (error.code === "user_banned") return { error: "Tu cuenta está bloqueada. Habla con el administrador" };
    return { error: "Correo o contraseña incorrectos" };
  }

  // Un usuario bloqueado no puede leer su perfil (RLS): sin perfil visible, no entra.
  const { data: perfil } = await supabase.from("profiles").select("id").eq("id", data.user.id).maybeSingle();
  if (!perfil) {
    await supabase.auth.signOut();
    return { error: "Tu cuenta está bloqueada. Habla con el administrador" };
  }

  redirect("/partidos");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
