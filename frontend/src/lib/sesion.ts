import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Rol } from "@/lib/tipos";

export interface Sesion {
  id: string;
  nombre: string;
  rol: Rol;
}

// Usuario actual. getClaims() valida el JWT; después se lee su perfil con RLS:
// un usuario bloqueado no puede leer ni su propio perfil, así que aquí queda como "sin sesión".
export const getSesion = cache(async (): Promise<Sesion | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;

  const { data: perfil } = await supabase.from("profiles").select("id, name, role").eq("id", id).maybeSingle();
  if (!perfil) return null;
  return { id: perfil.id, nombre: perfil.name, rol: perfil.role === "admin" ? "admin" : "player" };
});

// Para páginas: sin acceso (sin sesión o bloqueado) cierra la sesión y vuelve al login.
export async function exigirSesion(): Promise<Sesion> {
  const sesion = await getSesion();
  if (!sesion) redirect("/auth/signout");
  return sesion;
}

export async function exigirAdmin(): Promise<Sesion> {
  const sesion = await exigirSesion();
  if (sesion.rol !== "admin") redirect("/partidos?aviso=admin");
  return sesion;
}

// Para Server Actions (son endpoints públicos): devuelve un mensaje de error si quien llama no es admin.
export async function errorSiNoAdmin(): Promise<string | null> {
  const sesion = await getSesion();
  if (!sesion) redirect("/auth/signout"); // sesión vencida o revocada
  return sesion.rol === "admin" ? null : "Solo el administrador puede hacer esto";
}
