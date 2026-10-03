export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-md border-2 border-line bg-card p-8">
        <h1 className="mb-2 text-center text-4xl font-bold">Iniciar sesión</h1>
        <p className="mb-8 text-center text-xl text-ink/70">
          Entra para hacer tus predicciones
        </p>

        <form className="space-y-6">
          <div>
            <label htmlFor="nombre" className="mb-2 block text-xl font-semibold">
              Tu nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="username"
              className="w-full rounded-md border-2 border-line px-4 py-4 text-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xl font-semibold">
              Tu contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border-2 border-line px-4 py-4 text-xl focus:border-primary-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary-600 px-6 py-5 text-2xl font-bold text-white hover:bg-primary-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
