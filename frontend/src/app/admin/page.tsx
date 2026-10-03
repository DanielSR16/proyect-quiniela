import { formatearHora, partidos } from "@/lib/mock-data";

const inputClase =
  "block w-full min-w-0 rounded-md border-2 border-line px-4 py-3 text-xl focus:border-primary-500 focus:outline-none";

export default function AdminPage() {
  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold">Administración</h1>

      <section className="rounded-md border-2 border-line bg-card p-6">
        <h2 className="mb-5 text-3xl font-bold">Agregar partido</h2>
        <form className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="local" className="mb-2 block text-xl font-semibold">Equipo local</label>
            <input id="local" className={inputClase} />
          </div>
          <div>
            <label htmlFor="visitante" className="mb-2 block text-xl font-semibold">Equipo visitante</label>
            <input id="visitante" className={inputClase} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="hora" className="mb-2 block text-xl font-semibold">
              Hora del partido (cierra las predicciones)
            </label>
            <input id="hora" type="datetime-local" className={inputClase} />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary-600 px-6 py-4 text-xl font-bold text-white hover:bg-primary-700 sm:col-span-2"
          >
            Agregar partido
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-5 text-3xl font-bold">Partidos</h2>
        <ul className="space-y-4">
          {partidos.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-4 rounded-md border-2 border-line bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-2xl font-bold">{p.local} vs {p.visitante}</p>
                <p className="text-lg first-letter:uppercase text-ink/70">
                  {formatearHora(p.horaPartido)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input aria-label={`Goles ${p.local}`} type="number" min={0} defaultValue={p.resultadoLocal ?? ""} className="w-20 rounded-md border-2 border-line px-3 py-3 text-center text-2xl" />
                <span className="text-2xl font-bold">-</span>
                <input aria-label={`Goles ${p.visitante}`} type="number" min={0} defaultValue={p.resultadoVisitante ?? ""} className="w-20 rounded-md border-2 border-line px-3 py-3 text-center text-2xl" />
                <button type="button" className="rounded-md bg-primary-600 px-5 py-3 text-xl font-bold text-white hover:bg-primary-700">
                  Guardar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
