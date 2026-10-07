import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface Torneo {
  id: number;
  nombre: string;
  activo: boolean;
}

// Torneos disponibles y el que se está viendo: ?torneo=<id> si es válido; si no, el activo; si no, el más reciente.
export const cargarTorneos = cache(async (torneoParam?: string): Promise<{ torneos: Torneo[]; actual: Torneo | null }> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tournaments").select("id, name, is_active").order("id", { ascending: false });
  if (error) throw new Error(error.message);

  const torneos = data.map((t) => ({ id: t.id, nombre: t.name, activo: t.is_active }));
  const actual =
    torneos.find((t) => String(t.id) === torneoParam) ?? torneos.find((t) => t.activo) ?? torneos[0] ?? null;
  return { torneos, actual };
});
