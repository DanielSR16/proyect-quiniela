import Image from "next/image";
import Link from "next/link";
import { cerrarSesion } from "@/actions/auth";

export function Cabecera({ children, conSalir = false }: { children?: React.ReactNode; conSalir?: boolean }) {
  return (
    <header className="border-b-2 border-dashed border-cream/40">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-8 lg:gap-y-4">
        <div className="flex items-center justify-between gap-3 lg:contents">
          <Link href="/partidos" className="flex shrink-0 items-center gap-3 whitespace-nowrap font-display text-3xl leading-none tracking-wide text-gold-400">
            <Image src="/logo.jpg" alt="" width={96} height={96} priority className="h-12 w-12 rounded-full object-cover" />
            QUINIELEROS PINOLA
          </Link>
          {/* En celular estos botones van en la barra de abajo ("Cuenta") */}
          {conSalir && (
            <div className="hidden items-center gap-2 whitespace-nowrap sm:flex lg:order-2 lg:ml-auto">
              <Link
                href="/cuenta"
                className="rounded-full border border-cream/30 px-3 py-1.5 text-xs text-cream transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                Mi cuenta
              </Link>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-full border border-cream/30 px-3 py-1.5 text-xs text-cream transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                Cerrar sesión
              </button>
            </form>
            </div>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}
