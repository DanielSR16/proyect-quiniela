import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Cliente con la sesión del usuario (cookies). Todo lo que consulte pasa por RLS.
// Crea uno nuevo en cada petición; no lo guardes en una variable global.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Se llama desde un Server Component, donde no se pueden escribir cookies.
            // Se ignora porque el middleware ya refresca la sesión.
          }
        },
      },
    },
  );
}
