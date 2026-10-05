"use server";

import { revalidatePath } from "next/cache";
import { getSesion } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";
import type { Resultado } from "@/lib/tipos";

const golesValidos = (n: number) => Number.isInteger(n) && n >= 0 && n <= 20;

// Crea o reemplaza el pronóstico propio. El cierre lo valida la base de datos (RLS) con su reloj:
// después de la hora del partido el insert/update es rechazado.
export async function guardarPrediccion(partidoId: number, local: number, visitante: number): Promise<Resultado> {
  if (!Number.isInteger(partidoId) || !golesValidos(local) || !golesValidos(visitante)) {
    return { ok: false, error: "Los goles deben ser números del 0 al 20" };
  }
  if (!(await getSesion())) return { ok: false, error: "Tu sesión expiró, vuelve a entrar" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("predictions")
    .upsert({ match_id: partidoId, home_goals: local, away_goals: visitante }, { onConflict: "user_id,match_id" });

  if (error) {
    if (error.code === "42501") return { ok: false, error: "Los pronósticos de este partido ya cerraron" };
    if (error.code === "23503") return { ok: false, error: "Ese partido no existe" };
    return { ok: false, error: "No se pudo guardar el pronóstico. Intenta de nuevo" };
  }

  revalidatePath("/partidos");
  return { ok: true };
}
