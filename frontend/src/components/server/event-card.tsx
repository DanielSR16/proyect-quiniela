interface EventCardProps {
  event: {
    id: number;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    league: string;
    predictions: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-primary-600">
            {event.league}
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {formattedDate}
          </div>
        </div>
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
          {event.sport}
        </span>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-900 dark:text-gray-50">
            {event.homeTeam}
          </span>
          <span className="text-sm font-bold text-gray-500">vs</span>
          <span className="font-semibold text-gray-900 dark:text-gray-50">
            {event.awayTeam}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Predicciones realizadas
          </span>
          <span className="font-bold text-primary-600">
            {event.predictions.toLocaleString()}
          </span>
        </div>

        <button className="w-full btn btn-primary">
          Hacer Predicción
        </button>
      </div>
    </div>
  );
}
