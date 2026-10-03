import { calcularPuntos, misPredicciones, partidos } from "@/lib/mock-data";

export default function DashboardPage() {
  const historial = misPredicciones
    .map((pred) => {
      const partido = partidos.find((p) => p.id === pred.partidoId)!;
      const real =
        partido.resultadoLocal !== null && partido.resultadoVisitante !== null
          ? { local: partido.resultadoLocal, visitante: partido.resultadoVisitante }
          : null;
      return { pred, partido, real, puntos: real ? calcularPuntos(pred, real) : null };
    })
    .filter((h) => h.real);

  const total = historial.reduce((suma, h) => suma + (h.puntos ?? 0), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Mi puntuación</h1>

      <div className="rounded-md bg-primary-600 p-8 text-center text-white">
        <p className="text-xl">Tus puntos totales</p>
        <p className="text-7xl font-bold">{total}</p>
      </div>

      <section>
        <h2 className="mb-4 text-3xl font-bold">Mi historial</h2>
        <ul className="space-y-4">
          {historial.map(({ pred, partido, real, puntos }) => (
            <li
              key={partido.id}
              className="rounded-md border-2 border-line bg-card p-6"
            >
              <p className="text-2xl font-bold">
                {partido.local} vs {partido.visitante}
              </p>
              <p className="mt-2 text-xl">
                Resultado: <strong>{real!.local} - {real!.visitante}</strong>
              </p>
              <p className="text-xl">
                Tu predicción: <strong>{pred.local} - {pred.visitante}</strong>
              </p>
              <p
                className={`mt-3 inline-block rounded-md px-4 py-2 text-xl font-bold ${
                  puntos === 5
                    ? "bg-green-100 text-green-800"
                    : puntos === 3
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {puntos} {puntos === 1 ? "punto" : "puntos"}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
