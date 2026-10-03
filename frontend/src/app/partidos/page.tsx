import { Predictor } from "@/components/client/predictor";
import { formatearHora, misPredicciones, partidos } from "@/lib/mock-data";

export default function PartidosPage() {
  const proximos = partidos.filter((p) => p.resultadoLocal === null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Próximos partidos</h1>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
          Puedes cambiar tu predicción hasta la hora del partido.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {proximos.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
          >
            <p className="mb-5 text-lg font-semibold capitalize text-primary-600">
              {formatearHora(p.horaPartido)}
            </p>
            <Predictor
              local={p.local}
              visitante={p.visitante}
              inicial={misPredicciones.find((m) => m.partidoId === p.id)}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
