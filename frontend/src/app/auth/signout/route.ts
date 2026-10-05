import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Cierra la sesión y manda al login. Las páginas redirigen aquí cuando un usuario
// tiene sesión pero ya no tiene acceso (por ejemplo, fue bloqueado).
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login?motivo=sin-acceso", request.url));
}
