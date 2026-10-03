import { EventCard } from "@/components/server/event-card";
import { Hero } from "@/components/server/hero";

export default function Home() {
  const upcomingEvents = [
    {
      id: 1,
      sport: "Fútbol",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      date: "2026-10-15",
      league: "La Liga",
      predictions: 1243,
    },
    {
      id: 2,
      sport: "Fútbol",
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      date: "2026-10-15",
      league: "Premier League",
      predictions: 2156,
    },
    {
      id: 3,
      sport: "Basquetbol",
      homeTeam: "Lakers",
      awayTeam: "Celtics",
      date: "2026-10-16",
      league: "NBA",
      predictions: 891,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <Hero />

      {/* Upcoming Events Section */}
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Próximos Eventos</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Realiza tus predicciones en los eventos más emocionantes
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-6 sm:grid-cols-3">
        <StatCard label="Eventos Activos" value="42" icon="📊" />
        <StatCard label="Usuarios Activos" value="5,234" icon="👥" />
        <StatCard label="Predicciones Realizadas" value="12,456" icon="🎯" />
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="card text-center">
      <div className="text-4xl">{icon}</div>
      <div className="mt-4 text-2xl font-bold">{value}</div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {label}
      </div>
    </div>
  );
}
