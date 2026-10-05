import { Cabecera } from "@/components/cabecera";
import { Nav } from "@/components/client/nav";
import { exigirSesion } from "@/lib/sesion";

// Todo lo que está dentro de (app) requiere sesión activa (no bloqueada).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sesion = await exigirSesion();

  return (
    <>
      <Cabecera>
        <Nav esAdmin={sesion.rol === "admin"} />
      </Cabecera>
      <main className="mx-auto max-w-4xl px-5 pb-28 pt-8 sm:pb-12">{children}</main>
    </>
  );
}
