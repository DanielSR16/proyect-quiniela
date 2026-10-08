import { cerrarSesion } from "@/actions/auth";
import { CambiarPassword } from "@/components/client/cambiar-password";
import { exigirSesion } from "@/lib/sesion";

export default async function CuentaPage() {
  const sesion = await exigirSesion();
  return (
    <section className="ticket" aria-labelledby="cuenta">
      <h1 id="cuenta" className="etiqueta !font-sans">Mi cuenta</h1>
      <p className="mt-2 text-lg font-bold">{sesion.nombre}</p>
      <h2 className="mt-6 font-bold">Cambiar contraseña</h2>
      <CambiarPassword apodo={sesion.apodo} />
      <form action={cerrarSesion} className="mt-8 border-t-2 border-dashed border-trazo pt-6 sm:hidden">
        <button type="submit" className="w-full rounded-sm border-2 border-error px-5 py-3 text-base font-bold text-error hover:bg-error hover:text-cream">
          Cerrar sesión
        </button>
      </form>
    </section>
  );
}
