export default function Home() {
  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <section className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-20 text-white">
        <h1 className="mb-6 text-5xl font-bold">¡Bienvenido a Quiniela!</h1>
        <p className="mb-8 text-xl text-primary-100">
          Predice los resultados de los partidos de la Liga MX y gana puntos.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a href="/partidos" className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-bold text-primary-600 transition-transform hover:scale-105 text-center">
            Ver Próximos Partidos
          </a>
          <a href="/dashboard" className="inline-block rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 text-center">
            Ver Mi Puntuación
          </a>
        </div>
      </section>

      {/* Stats Principales */}
      <section>
        <h2 className="mb-6 text-3xl font-bold">Estadísticas</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Eventos Activos" value="8" emoji="📊" />
          <StatCard label="Usuarios Activos" value="124" emoji="👥" />
          <StatCard label="Total Predicciones" value="1,256" emoji="🎯" />
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  emoji: string;
}

function StatCard({ label, value, emoji }: StatCardProps) {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 text-5xl">{emoji}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-2 text-lg text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
