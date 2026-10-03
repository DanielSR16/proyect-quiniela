import { jugadores } from "@/lib/mock-data";

const medallas = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const ordenados = [...jugadores].sort((a, b) => b.puntos - a.puntos);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Ranking</h1>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
          Los puntos de todos los participantes.
        </p>
      </div>

      <ol className="space-y-3">
        {ordenados.map((j, i) => (
          <li
            key={j.id}
            className="flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-900"
          >
            <span className="flex items-center gap-4 text-2xl font-bold">
              <span className="w-12 text-center">{medallas[i] ?? `${i + 1}.`}</span>
              {j.nombre}
            </span>
            <span className="text-2xl font-bold text-primary-600">{j.puntos} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
