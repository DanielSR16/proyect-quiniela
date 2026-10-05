"use server";

import { revalidatePath } from "next/cache";
import { errorSiNoAdmin } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import type { Resultado } from "@/lib/tipos";

// Solo un admin: se comprueba aquí y además lo exige RLS en la base.

export interface DatosTorneo {
  tipo: "apertura" | "clausura";
  anio: number;
}

const refrescar = () => revalidatePath("/", "layout");

export async function crearTorneo(d: DatosTorneo): Promise<Resultado> {
  const error = await errorSiNoAdmin();
  if (error) return { ok: false, error };
  if (d.tipo !== "apertura" && d.tipo !== "clausura") return { ok: false, error: "Tipo de torneo inválido" };
  if (!Number.isInteger(d.anio) || d.anio < 2000 || d.anio > 2100) return { ok: false, error: "Año inválido" };

  const nombre = `${d.tipo === "apertura" ? "Apertura" : "Clausura"} ${d.anio}`;
  const supabase = await createClient();
  const { error: fallo } = await supabase.from("tournaments").insert({ name: nombre, kind: d.tipo, year: d.anio });
  if (fallo) return { ok: false, error: fallo.code === "23505" ? `${nombre} ya existe` : "No se pudo crear el torneo" };

  refrescar();
  return { ok: true };
}

// Solo un torneo activo a la vez (índice único parcial): primero se desactiva el actual y luego se activa el elegido.
export async function activarTorneo(id: number): Promise<Resultado> {
  const error = await errorSiNoAdmin();
  if (error) return { ok: false, error };

  const supabase = await createClient();
  const { data: existe } = await supabase.from("tournaments").select("id").eq("id", id).maybeSingle();
  if (!existe) return { ok: false, error: "Ese torneo no existe" };

  const { error: baja } = await supabase.from("tournaments").update({ is_active: false }).eq("is_active", true);
  if (baja) return { ok: false, error: "No se pudo cambiar el torneo activo" };
  const { error: alta } = await supabase.from("tournaments").update({ is_active: true }).eq("id", id);
  if (alta) return { ok: false, error: "No se pudo activar el torneo" };

  refrescar();
  return { ok: true };
}
