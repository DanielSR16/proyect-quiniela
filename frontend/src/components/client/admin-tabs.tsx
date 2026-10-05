"use client";

import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Partidos" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export function AdminTabs() {
  const ruta = usePathname();
  return (
    <nav aria-label="Administración" className="mb-6 flex gap-2">
      {tabs.map((t) => {
        const activo = ruta === t.href;
        return (
          <a
            key={t.href}
            href={t.href}
            aria-current={activo ? "page" : undefined}
            className={`rounded-full border px-5 py-2 text-sm transition-colors ${
              activo
                ? "border-gold-400 bg-gold-400 font-bold text-forest-900"
                : "border-cream/30 text-cream hover:text-gold-400"
            }`}
          >
            {t.label}
          </a>
        );
      })}
    </nav>
  );
}
