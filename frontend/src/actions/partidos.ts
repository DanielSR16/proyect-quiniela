"use server";

import { revalidatePath } from "next/cache";
import { equipos } from "@/lib/equipos";
import { errorSiNoAdmin } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import type { Resultado } from "@/lib/tipos";

// Todas estas acciones las puede ejecutar solo un admin: se comprueba aquí y además lo exige RLS en la base.

export interface DatosPartido {
  local: string;
  visitante: string;
  jornada: number;
  horaPartido: string; // ISO con zona
}

function validarPartido(d: DatosPartido): string | null {
  if (!equipos.includes(d.local) || !equipos.includes(d.visitante)) return "Ese equipo no está en la lista";
  if (d.local === d.visitante) return "El local y el visitante deben ser distintos";
  if (!Number.isInteger(d.jornada) || d.jornada < 1 || d.jornada > 30) return "La jornada debe ser del 1 al 30";
  if (Number.isNaN(new Date(d.horaPartido).getTime())) return "Hora inválida";
  return null;
}

const refrescar = () => revalidatePath("/", "layout");

export async function crearPartido(d: DatosPartido): Promise<Resultado> {
  const error = (await errorSiNoAdmin()) ?? validarPartido(d);
  if (error) return { ok: false, error };

  const supabase = await createClient();
  const { error: fallo } = await supabase
    .from("matches")
    .insert({ round: d.jornada, home_team: d.local, away_team: d.visitante, kickoff_at: d.horaPartido });
  if (fallo) return { ok: false, error: "No se pudo agregar el partido" };

  refrescar();
  return { ok: true };
}

export async function actualizarPartido(id: number, d: DatosPartido): Promise<Resultado> {
  const error = (await errorSiNoAdmin()) ?? validarPartido(d);
  if (error) return { ok: false, error };

  const supabase = await createClient();
  const { data, error: fallo } = await supabase
    .from("matches")
    .update({ round: d.jornada, home_team: d.local, away_team: d.visitante, kickoff_at: d.horaPartido })
    .eq("id", id)
    .select("id");
  if (fallo) return { ok: false, error: "No se pudo guardar el partido" };
  if (!data?.length) return { ok: false, error: "Ese partido no existe" };

  refrescar();
  return { ok: true };
}

// Eliminar un partido borra sus pronósticos (cascada): dejan de contar y el ranking cambia solo.
export async function eliminarPartido(id: number): Promise<Resultado> {
  const error = await errorSiNoAdmin();
  if (error) return { ok: false, error };

  const supabase = await createClient();
  const { data, error: fallo } = await supabase.from("matches").delete().eq("id", id).select("id");
  if (fallo) return { ok: false, error: "No se pudo eliminar el partido" };
  if (!data?.length) return { ok: false, error: "Ese partido no existe" };

  refrescar();
  return { ok: true };
}

// Captura o corrige el resultado final. Un trigger en la base recalcula los puntos de todos los pronósticos.
export async function guardarResultado(id: number, local: number, visitante: number): Promise<Resultado> {
  const error = await errorSiNoAdmin();
  if (error) return { ok: false, error };
  const valido = (n: number) => Number.isInteger(n) && n >= 0 && n <= 99;
  if (!valido(local) || !valido(visitante)) return { ok: false, error: "Los goles deben ser números del 0 al 99" };

  const supabase = await createClient();
  const { data, error: fallo } = await supabase
    .from("matches")
    .update({ home_score: local, away_score: visitante })
    .eq("id", id)
    .select("id");
  if (fallo) return { ok: false, error: "No se pudo guardar el resultado" };
  if (!data?.length) return { ok: false, error: "Ese partido no existe" };

  refrescar();
  return { ok: true };
}
