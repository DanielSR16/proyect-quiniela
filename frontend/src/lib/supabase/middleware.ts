import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

// Refresca la sesión en cada petición y manda a /login a quien no la tenga.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // No pongas código entre createServerClient y getClaims(): podría cerrar sesiones al azar.
  // getClaims() valida la firma del JWT; getSession() no es de fiar en el servidor.
  const { data } = await supabase.auth.getClaims();
  const autenticado = !!data?.claims;

  const ruta = request.nextUrl.pathname;
  const publica = ruta === "/login" || ruta.startsWith("/auth");
  if (!autenticado && !publica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const redireccion = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redireccion.cookies.set(c));
    return redireccion;
  }

  return response;
}
