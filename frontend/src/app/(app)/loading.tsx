// Se muestra al instante mientras la página consulta Supabase.
export default function Cargando() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="animate-pulse space-y-4">
      <div className="flex gap-2">
        <div className="h-8 w-28 rounded-full bg-forest-800" />
        <div className="h-8 w-28 rounded-full bg-forest-800" />
      </div>
      <div className="h-10 w-48 rounded bg-forest-800" />
      <div className="h-40 rounded bg-forest-800" />
      <div className="h-40 rounded bg-forest-800" />
    </div>
  );
}
