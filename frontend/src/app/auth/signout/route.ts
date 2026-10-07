import { NextResponse, type NextRequest } from "next/server";
import { getSesion } from "@/lib/sesion";
import { createClient } from "@/lib/supabase/server";

// Las páginas redirigen aquí cuando un usuario tiene sesión pero ya no tiene acceso
// (por ejemplo, fue bloqueado o abrió sesión en otro dispositivo).
// Solo cierra la sesión si de verdad ya no sirve: así un enlace externo no puede cerrarle la sesión
// a un usuario activo (el cierre voluntario es la acción cerrarSesion, que no es un GET).
export async function GET(request: NextRequest) {
  if (!(await getSesion())) {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?motivo=sin-acceso", request.url));
  }
  return NextResponse.redirect(new URL("/partidos", request.url));
}
