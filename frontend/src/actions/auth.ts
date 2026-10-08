"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface EstadoLogin {
  error?: string;
  correo?: string; // se devuelve para no obligar a reescribirlo tras un error
}

// Si escribió un apodo (sin @), busca el correo de esa cuenta. Devuelve null si no existe.
async function correoDeApodo(apodo: string): Promise<string | null> {
  const admin = createAdminClient();
  const comodines = apodo.replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data } = await admin.from("profiles").select("id").ilike("nickname", comodines).limit(2);
  if (data?.length !== 1) return null;
  const { data: u } = await admin.auth.admin.getUserById(data[0].id);
  return u.user?.email ?? null;
}

export async function iniciarSesion(_previo: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const correo = String(formData.get("correo") ?? "").trim(); // correo o apodo
  const password = String(formData.get("password") ?? "");
  if (!correo || !password) return { error: "Escribe tu apodo o correo y tu contraseña", correo };

  // Si no existe el apodo se prueba con un correo imposible, para que el error sea igual al de contraseña incorrecta.
  const email = correo.includes("@") ? correo : ((await correoDeApodo(correo)) ?? "no-existe@invalid.local");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "user_banned") return { error: "Tu cuenta está bloqueada. Habla con el administrador", correo };
    return { error: "Apodo, correo o contraseña incorrectos", correo };
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
