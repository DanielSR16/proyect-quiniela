"use client";

import { usePathname } from "next/navigation";

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
  {
    href: "/login",
    label: "Cerrar sesión",
    corto: "Salir",
    icono: (
      <svg {...iconProps}>
        <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H10" />
      </svg>
    ),
  },
];

export function Nav() {
  const ruta = usePathname();

  return (
    <>
      {/* Tablet y PC: pestañas en la cabecera */}
      <nav
        aria-label="Principal"
        className="hidden w-full items-center gap-1 rounded-full border border-cream/20 bg-forest-800 p-1 text-sm sm:flex lg:ml-auto lg:w-auto"
      >
        {enlaces.map((e) => {
          const activo = ruta.startsWith(e.href);
          return (
            <a
              key={e.href}
              href={e.href}
              aria-current={activo ? "page" : undefined}
              className={`flex-1 rounded-full px-4 py-2 text-center transition-colors lg:flex-none ${
                activo
                  ? "bg-gold-400 font-bold text-forest-900"
                  : "text-cream hover:bg-forest-700 hover:text-gold-400"
              }`}
            >
              {e.label}
            </a>
          );
        })}
      </nav>

      {/* Móvil: barra inferior tipo app */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-gold-400/60 bg-forest-900 pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="mx-auto flex max-w-md">
          {enlaces.map((e) => {
            const activo = ruta.startsWith(e.href);
            return (
              <li key={e.href} className="flex-1">
                <a
                  href={e.href}
                  aria-current={activo ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[11px] leading-none ${
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
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
