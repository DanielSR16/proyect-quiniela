"use client";

import { useState, useTransition } from "react";
import { cambiarPassword } from "@/actions/cuenta";

export function CambiarPassword({ apodo }: { apodo: string }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [enviando, iniciarEnvio] = useTransition();
  const tipo = ver ? "text" : "password";

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setExito(false);
        if (nueva !== repetir) return setError("Las contraseñas nuevas no coinciden");
        iniciarEnvio(async () => {
          const r = await cambiarPassword(actual, nueva);
          if (r.ok) {
            setError(null);
            setExito(true);
            setActual("");
            setNueva("");
            setRepetir("");
          } else {
            setError(r.error);
          }
        });
      }}
    >
      {/* Campo de usuario oculto: así el gestor de contraseñas del celular no rellena "tu usuario" en la contraseña actual. */}
      <input type="text" name="username" autoComplete="username" defaultValue={apodo} readOnly tabIndex={-1} aria-hidden="true" className="sr-only" />
      <div>
        <label htmlFor="pw-actual" className="mb-1.5 block font-bold">Contraseña actual</label>
        <input id="pw-actual" type={tipo} required autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} className="campo" />
      </div>
      <div>
        <label htmlFor="pw-nueva" className="mb-1.5 block font-bold">Contraseña nueva</label>
        <input id="pw-nueva" type={tipo} required minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={nueva} onChange={(e) => setNueva(e.target.value)} className="campo" />
      </div>
      <div>
        <label htmlFor="pw-repetir" className="mb-1.5 block font-bold">Repite la contraseña nueva</label>
        <input id="pw-repetir" type={tipo} required minLength={8} autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} className="campo" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} />
        Mostrar contraseñas
      </label>
      {error && <p role="alert" className="font-bold text-error">{error}</p>}
      {exito && <p role="status" className="font-bold text-forest-700">✓ Contraseña cambiada</p>}
      <button type="submit" disabled={enviando} className="boton w-full disabled:opacity-60 sm:w-auto">
        {enviando ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
