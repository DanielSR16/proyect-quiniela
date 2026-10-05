"use server";

import { revalidatePath } from "next/cache";
import { errorSiNoAdmin } from "@/lib/sesion";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Resultado, Rol } from "@/lib/tipos";

// Crear usuarios y cambiar contraseñas requiere la service_role (auth.admin), que solo existe en el servidor.
// Cada acción comprueba primero que quien llama sea admin.

export interface DatosUsuario {
  nombre: string;
  correo: string;
  rol: Rol;
  password?: string; // obligatoria al crear; al editar, vacía = no cambia
}

function validar(d: DatosUsuario, creando: boolean): string | null {
  const nombre = d.nombre.trim();
  if (nombre.length < 1 || nombre.length > 60) return "Escribe el nombre (máximo 60 caracteres)";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) return "Correo inválido";
  if (d.rol !== "admin" && d.rol !== "player") return "Rol inválido";
  if ((creando || d.password) && (d.password ?? "").length < 6) return "La contraseña debe tener al menos 6 caracteres";
  return null;
}

// Para comparar nombres sin importar mayúsculas con ilike sin que % o _ funcionen como comodines.
const escaparLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

async function nombreEnUso(nombre: string, exceptoId?: string): Promise<boolean> {
  let consulta = createAdminClient().from("profiles").select("id").ilike("name", escaparLike(nombre)).limit(1);
  if (exceptoId) consulta = consulta.neq("id", exceptoId);
  const { data } = await consulta;
  return !!data?.length;
}

export async function crearUsuario(d: DatosUsuario): Promise<Resultado> {
  const error = (await errorSiNoAdmin()) ?? validar(d, true);
  if (error) return { ok: false, error };
  const nombre = d.nombre.trim();
  if (await nombreEnUso(nombre)) return { ok: false, error: "Ya existe un usuario con ese nombre" };

  const admin = createAdminClient();
  const { data, error: fallo } = await admin.auth.admin.createUser({
    email: d.correo.trim(),
    password: d.password,
    email_confirm: true,
    user_metadata: { name: nombre },
  });
  if (fallo || !data.user) {
    const repetido = fallo?.code === "email_exists" || fallo?.message.toLowerCase().includes("already");
    return { ok: false, error: repetido ? "Ese correo ya está registrado" : "No se pudo crear el usuario" };
  }

  // Un trigger crea el perfil como 'player'; si debe ser admin se sube aquí (el rol nunca viaja en user_metadata).
  if (d.rol === "admin") {
    const { error: rolFallo } = await admin.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
    if (rolFallo) return { ok: false, error: "El usuario se creó, pero no se pudo asignar el rol de administrador" };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function editarUsuario(id: string, d: DatosUsuario): Promise<Resultado> {
  const error = (await errorSiNoAdmin()) ?? validar(d, false);
  if (error) return { ok: false, error };
  const nombre = d.nombre.trim();
  if (await nombreEnUso(nombre, id)) return { ok: false, error: "Ya existe un usuario con ese nombre" };

  const admin = createAdminClient();
  // Un trigger rechaza degradar al último admin activo ("Debe quedar al menos un administrador activo").
  const { data, error: fallo } = await admin.from("profiles").update({ name: nombre, role: d.rol }).eq("id", id).select("id");
  if (fallo) return { ok: false, error: fallo.code === "P0001" ? fallo.message : "No se pudo guardar el usuario" };
  if (!data?.length) return { ok: false, error: "Ese usuario no existe" };

  const { error: authFallo } = await admin.auth.admin.updateUserById(id, {
    email: d.correo.trim(),
    email_confirm: true,
    ...(d.password ? { password: d.password } : {}),
  });
  if (authFallo) {
    const repetido = authFallo.code === "email_exists" || authFallo.message.toLowerCase().includes("already");
    return { ok: false, error: repetido ? "Ese correo ya lo usa otro usuario" : "Se guardó el nombre y rol, pero no el correo o la contraseña" };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

// Los usuarios no se eliminan: se bloquean. Conservan historial y pronósticos.
// Se bloquea el perfil (RLS le quita acceso a todo al instante) y además se banea en Auth para que no pueda reingresar.
export async function cambiarBloqueo(id: string, bloqueado: boolean): Promise<Resultado> {
  const error = await errorSiNoAdmin();
  if (error) return { ok: false, error };

  const admin = createAdminClient();
  const { data, error: fallo } = await admin.from("profiles").update({ blocked: bloqueado }).eq("id", id).select("id");
  if (fallo) return { ok: false, error: fallo.code === "P0001" ? fallo.message : "No se pudo cambiar el bloqueo" };
  if (!data?.length) return { ok: false, error: "Ese usuario no existe" };

  const { error: banFallo } = await admin.auth.admin.updateUserById(id, { ban_duration: bloqueado ? "876000h" : "none" });
  if (banFallo) {
    await admin.from("profiles").update({ blocked: !bloqueado }).eq("id", id);  // deshace para no dejarlo a medias
    return { ok: false, error: "No se pudo cambiar el bloqueo. Intenta de nuevo" };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}
