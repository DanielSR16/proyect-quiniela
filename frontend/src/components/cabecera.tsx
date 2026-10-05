export function Cabecera({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b-2 border-dashed border-cream/40">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:gap-8">
        <a href="/partidos" className="font-display text-3xl leading-none tracking-wide text-gold-400">
          QUINIELA LIGA MX
        </a>
        {children}
      </div>
    </header>
  );
}
