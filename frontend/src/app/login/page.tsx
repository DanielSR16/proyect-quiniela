export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
        <h1 className="mb-2 text-center text-4xl font-bold">Iniciar sesión</h1>
        <p className="mb-8 text-center text-xl text-gray-600 dark:text-gray-400">
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
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-xl focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
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
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-xl focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary-600 px-6 py-5 text-2xl font-bold text-white hover:bg-primary-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
