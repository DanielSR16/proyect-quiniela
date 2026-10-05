import type { Torneo } from "@/lib/torneos";

// Enlaces ?torneo=<id>: la página (servidor) vuelve a cargar con los datos de ese torneo.
export function SelectorTorneo({ torneos, actual }: { torneos: Torneo[]; actual: Torneo }) {
  return (
    <nav aria-label="Torneos" className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 pb-1">
      {torneos.map((t) => (
        <a
          key={t.id}
          href={`?torneo=${t.id}`}
          aria-current={t.id === actual.id ? "true" : undefined}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
            t.id === actual.id
              ? "border-cream bg-cream font-bold text-forest-900"
              : "border-cream/30 text-cream hover:text-gold-400"
          }`}
        >
          {t.nombre}
          {t.activo && <span className="ml-1.5 text-xs opacity-70">· actual</span>}
        </a>
      ))}
    </nav>
  );
}
