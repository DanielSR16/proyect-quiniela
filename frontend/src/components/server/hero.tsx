export function Hero() {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-16 text-white">
      <h1 className="mb-4 text-5xl font-bold">¡Bienvenido a Quiniela!</h1>
      <p className="mb-8 text-lg text-primary-100">
        Predice los resultados de tus eventos deportivos favoritos, compite con
        otros usuarios y gana premios.
      </p>
      <button className="btn bg-white text-primary-600 hover:bg-primary-50">
        Comenzar a Predecir
      </button>
    </div>
  );
}
