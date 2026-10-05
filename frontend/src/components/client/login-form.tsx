"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "@/actions/auth";

export function LoginForm() {
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});

  return (
    <form action={accion} className="ticket space-y-5">
      <div>
        <label htmlFor="correo" className="mb-1.5 block font-bold">Tu correo</label>
        <input id="correo" name="correo" type="email" required autoComplete="username" className="campo" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block font-bold">Tu contraseña</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="campo" />
      </div>
      {estado.error && <p role="alert" className="font-bold text-error">{estado.error}</p>}
      <button type="submit" disabled={pendiente} className="boton w-full disabled:opacity-60">
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
