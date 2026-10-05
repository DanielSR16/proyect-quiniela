import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Cliente con la service_role: se salta RLS. SOLO para Server Actions y páginas de administración,
// y siempre después de comprobar que quien llama es admin (ver lib/sesion.ts). Nunca en el navegador.
export function createAdminClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
