"use client";

import { useActionState, useState } from "react";
import { iniciarSesion, type EstadoLogin } from "@/actions/auth";

const icono = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const entrada =
  "block w-full min-w-0 rounded-2xl border border-cream/15 bg-forest-800 py-4 pl-12 pr-4 text-base text-cream placeholder:text-cream/40 focus:border-gold-400 focus:outline-none";

export function LoginForm() {
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(iniciarSesion, {});
  const [verPassword, setVerPassword] = useState(false);

  return (
    <form action={accion} className="space-y-4">
      <div className="relative">
        <label htmlFor="correo" className="sr-only">Correo</label>
        <svg {...icono} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream/50">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        <input id="correo" name="correo" type="email" required defaultValue={estado.correo} autoComplete="username" placeholder="Correo" className={entrada} />
      </div>
      <div className="relative">
        <label htmlFor="password" className="sr-only">Contraseña</label>
        <svg {...icono} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream/50">
          <rect x="4" y="11" width="16" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <input
          id="password"
          name="password"
          type={verPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          placeholder="Contraseña"
          className={`${entrada} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVerPassword((v) => !v)}
          aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-cream/60 hover:text-gold-400"
        >
          <svg {...icono}>
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {verPassword && <path d="M4 4l16 16" />}
          </svg>
        </button>
      </div>
      {estado.error && (
        <p role="alert" className="rounded-2xl border border-error bg-error/20 px-4 py-3 text-sm text-cream">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-full bg-gold-400 py-4 text-base font-bold text-forest-900 shadow-lg shadow-black/30 transition-colors hover:bg-gold-500 active:translate-y-px disabled:opacity-60"
      >
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
