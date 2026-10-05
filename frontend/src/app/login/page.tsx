export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-5xl text-gold-400">Entrar</h1>
      <p className="mb-8 mt-2 text-cream/70">Entra para hacer tus pronósticos.</p>

      <form className="ticket space-y-5">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block font-bold">Tu nombre</label>
          <input id="nombre" name="nombre" type="text" autoComplete="username" className="campo" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block font-bold">Tu contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" className="campo" />
        </div>
        <button type="submit" className="boton w-full">Entrar</button>
      </form>
    </div>
  );
}
