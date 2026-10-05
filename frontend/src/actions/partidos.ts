"use server";

import { revalidatePath } from "next/cache";
import { TOTAL_JORNADAS, nombreJornada } from "@/lib/jornadas";
import { errorSiNoAdmin } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import type { Resultado } from "@/lib/tipos";

// Todas estas acciones las puede ejecutar solo un admin: se comprueba aquí y además lo exige RLS en la base.

export interface DatosPartido {
  torneoId: number;
  localId: number;
  visitanteId: number;
  jornada: number;
  horaPartido: string; // ISO con zona
}

function validarPartido(d: DatosPartido): string | null {
  if (!Number.isInteger(d.localId) || !Number.isInteger(d.visitanteId)) return "Selecciona los dos equipos";
  if (d.localId === d.visitanteId) return "El local y el visitante deben ser distintos";
  if (!Number.isInteger(d.jornada) || d.jornada < 1 || d.jornada > TOTAL_JORNADAS) return "Jornada inválida";
  if (Number.isNaN(new Date(d.horaPartido).getTime())) return "Hora inválida";
  return null;
}

const refrescar = () => revalidatePath("/", "layout");

const aMinuto = (ms: number) => Math.floor(ms / 60_000) * 60_000;
const MENSAJE_PASADO = "La hora del partido no puede ser anterior a la hora actual";

export async function crearPartido(d: DatosPartido): Promise<Resultado> {
  const error = (await errorSiNoAdmin()) ?? validarPartido(d);
  if (error) return { ok: false, error };

  // No se pueden crear partidos con hora anterior al minuto actual.
  if (aMinuto(new Date(d.horaPartido).getTime()) < aMinuto(Date.now())) return { ok: false, error: MENSAJE_PASADO };

  const supabase = await createClient();
  const { data: jornada } = await supabase.from("rounds").select("finished").eq("tournament_id", d.torneoId).eq("number", d.jornada).maybeSingle();
  if (jornada?.finished) return { ok: false, error: `${nombreJornada(d.jornada)} está terminada; actívala para agregar partidos` };

  const { error: fallo } = await supabase
    .from("matches")
    .insert({ tournament_id: d.torneoId, round: d.jornada, home_team_id: d.localId, away_team_id: d.visitanteId, kickoff_at: d.horaPartido });
  if (fallo) return { ok: false, error: "No se pudo agregar el partido" };

  refrescar();
  return { ok: true };
}

export async function actualizarPartido(id: number, d: DatosPartido): Promise<Resultado> {
  const error = (await errorSiNoAdmin()) ?? validarPartido(d);
  if (error) return { ok: false, error };

  const supabase = await createClient();

  // La misma regla al editar, pero solo si la hora cambia: corregir equipos o jornada de un partido
  // que ya empezó sigue permitido dejando su hora como está.
  const { data: actual } = await supabase.from("matches").select("kickoff_at, round, tournament_id").eq("id", id).maybeSingle();
  if (!actual) return { ok: false, error: "Ese partido no existe" };
  if (d.jornada !== actual.round) {
    const { data: jornada } = await supabase.from("rounds").select("finished").eq("tournament_id", actual.tournament_id).eq("number", d.jornada).maybeSingle();
    if (jornada?.finished) return { ok: false, error: `${nombreJornada(d.jornada)} está terminada; actívala para mover partidos a ella` };
  }
  const nueva = aMinuto(new Date(d.horaPartido).getTime());
  if (nueva !== aMinuto(new Date(actual.kickoff_at).getTime()) && nueva < aMinuto(Date.now())) {
    return { ok: false, error: MENSAJE_PASADO };
  }

  const { data, error: fallo } = await supabase
    .from("matches")
    .update({ round: d.jornada, home_team_id: d.localId, away_team_id: d.visitanteId, kickoff_at: d.horaPartido })
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

// Una jornada terminada no admite partidos nuevos (lo exige también un trigger en la base) hasta reactivarla.
export async function cambiarEstadoJornada(torneoId: number, numero: number, terminada: boolean): Promise<Resultado> {
  const error = await errorSiNoAdmin();
  if (error) return { ok: false, error };
  if (!Number.isInteger(numero) || numero < 1 || numero > TOTAL_JORNADAS) return { ok: false, error: "Jornada inválida" };

  const supabase = await createClient();
  const { data, error: fallo } = await supabase.from("rounds").update({ finished: terminada }).eq("tournament_id", torneoId).eq("number", numero).select("number");
  if (fallo) return { ok: false, error: "No se pudo cambiar la jornada" };
  if (!data?.length) return { ok: false, error: "Esa jornada no existe" };

  refrescar();
  return { ok: true };
}
