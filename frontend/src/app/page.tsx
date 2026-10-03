export default function Home() {
  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <section className="rounded-md bg-primary-600 border-b-4 border-gold-500 px-8 py-20 text-white">
        <h1 className="mb-6 text-5xl font-bold">¡Bienvenido a Quiniela!</h1>
        <p className="mb-8 text-xl text-card/85">
          Predice los resultados de los partidos de la Liga MX y gana puntos.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a href="/partidos" className="inline-block rounded-md bg-card px-8 py-4 text-lg font-bold text-primary-600 transition-transform hover:scale-105 text-center">
            Ver Próximos Partidos
          </a>
          <a href="/dashboard" className="inline-block rounded-md border-2 border-white px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 text-center">
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
    <div className="rounded-md border-2 border-line bg-card p-8 text-center">
      <div className="mb-4 text-5xl">{emoji}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-2 text-lg text-ink/70">{label}</div>
    </div>
  );
}
