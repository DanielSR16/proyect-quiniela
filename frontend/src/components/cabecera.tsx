import Image from "next/image";
import Link from "next/link";
import { cerrarSesion } from "@/actions/auth";

export function Cabecera({ children, conSalir = false }: { children?: React.ReactNode; conSalir?: boolean }) {
  return (
    <header className="border-b-2 border-dashed border-cream/40">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex items-center justify-between gap-3 lg:contents">
          <Link href="/partidos" className="flex items-center gap-3 font-display text-3xl leading-none tracking-wide text-gold-400">
            <Image src="/logo.jpg" alt="" width={96} height={96} priority className="h-12 w-12 rounded-full object-cover" />
            QUINIELEROS PINOLA
          </Link>
          {conSalir && (
            <form action={cerrarSesion} className="lg:order-last">
              <button
                type="submit"
                className="rounded-full border border-cream/30 px-3 py-1.5 text-xs text-cream transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                Cerrar sesión
              </button>
            </form>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}
