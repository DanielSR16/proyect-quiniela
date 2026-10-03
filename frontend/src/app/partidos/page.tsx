import { Predictor } from "@/components/client/predictor";
import { formatearHora, misPredicciones, partidos } from "@/lib/mock-data";

export default function PartidosPage() {
  const proximos = partidos.filter((p) => p.resultadoLocal === null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Próximos partidos</h1>
        <p className="mt-2 text-xl text-ink/70">
          Puedes cambiar tu predicción hasta la hora del partido.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {proximos.map((p) => (
          <article
            key={p.id}
            className="rounded-md border-2 border-line bg-card p-6"
          >
            <p className="mb-5 text-lg font-semibold first-letter:uppercase text-primary-600">
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
