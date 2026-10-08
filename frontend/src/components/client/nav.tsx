"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const enlaces = [
  {
    href: "/partidos",
    label: "Predicciones",
    corto: "Jugar",
    icono: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="m12 8 3.5 2.5-1.3 4h-4.4l-1.3-4z" />
      </svg>
    ),
  },
  {
    href: "/ranking",
    label: "Posiciones",
    corto: "Tabla",
    icono: (
      <svg {...iconProps}>
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Historial",
    corto: "Historial",
    icono: (
      <svg {...iconProps}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    href: "/admin",
    label: "Admin",
    corto: "Admin",
    icono: (
      <svg {...iconProps}>
        <path d="M12 3 4 6v6c0 4.5 3.4 7.8 8 9 4.6-1.2 8-4.5 8-9V6z" />
      </svg>
    ),
  },
];

const enlaceCuenta = {
  href: "/cuenta",
  label: "Mi cuenta",
  corto: "Cuenta",
  icono: (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

export function Nav({ esAdmin }: { esAdmin: boolean }) {
  const ruta = usePathname();
  // Con el teclado abierto la barra se esconde: flotaba encima del teclado y tapaba los campos.
  // Se detecta por el tamaño visible de la pantalla (no por el foco: en el celular un campo puede seguir
  // enfocado con el teclado cerrado, y la barra se quedaba escondida).
  const [escribiendo, setEscribiendo] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    let base = vv.height;
    const revisar = () => {
      if (vv.height > base) base = vv.height;
      setEscribiendo(base - vv.height > 150);
    };
    const girar = () => {
      base = vv.height;
      revisar();
    };
    // Tocar fuera de un campo cierra el teclado.
    const fuera = (e: Event) => {
      const el = document.activeElement;
      if (el instanceof HTMLElement && el !== e.target && !el.contains(e.target as Node) && el.matches("input, textarea, select")) el.blur();
    };
    vv.addEventListener("resize", revisar);
    window.addEventListener("orientationchange", girar);
    document.addEventListener("pointerdown", fuera);
    return () => {
      vv.removeEventListener("resize", revisar);
      window.removeEventListener("orientationchange", girar);
      document.removeEventListener("pointerdown", fuera);
    };
  }, []);

  const visibles = enlaces.filter((e) => e.href !== "/admin" || esAdmin);

  return (
    <>
      {/* Tablet y PC: pestañas en la cabecera */}
      <nav
        aria-label="Principal"
        className="hidden w-full items-center gap-1 rounded-full border border-cream/20 bg-forest-800 p-1 text-sm sm:flex lg:order-3"
      >
        {visibles.map((e) => {
          const activo = ruta.startsWith(e.href);
          return (
            <Link
              key={e.href}
              href={e.href}
              aria-current={activo ? "page" : undefined}
              className={`flex-1 rounded-full px-4 py-2 text-center transition-colors ${
                activo
                  ? "bg-gold-400 font-bold text-forest-900"
                  : "text-cream hover:bg-forest-700 hover:text-gold-400"
              }`}
            >
              {e.label}
            </Link>
          );
        })}
      </nav>

      {/* Móvil: barra inferior tipo app */}
      <nav
        aria-label="Principal"
        className={`fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md transform-gpu rounded-2xl border border-gold-400/60 bg-forest-900 shadow-lg shadow-black/30 transition-transform duration-200 sm:hidden ${
          escribiendo ? "translate-y-[200%]" : ""
        }`}
      >
        <ul className="mx-auto flex max-w-md">
          {[...visibles, enlaceCuenta].map((e) => {
            const activo = ruta.startsWith(e.href);
            return (
              <li key={e.href} className="flex-1">
                <Link
                  href={e.href}
                  aria-current={activo ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 px-1 pb-2 pt-2 text-[11px] leading-none ${
                    activo ? "text-gold-400" : "text-cream/70"
                  }`}
                >
                  <span
                    className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                      activo ? "bg-gold-400/20" : ""
                    }`}
                  >
                    {e.icono}
                  </span>
                  <span className={activo ? "font-bold" : ""}>{e.corto}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
