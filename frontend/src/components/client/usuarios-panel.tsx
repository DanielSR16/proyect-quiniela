"use client";

import { useEffect, useState, useTransition } from "react";
import { cambiarBloqueo, crearUsuario, editarUsuario } from "@/actions/usuarios";
import type { Rol, Usuario } from "@/lib/tipos";

// Devuelve un mensaje de error, o null si todo salió bien.
type Guardar = (u: Usuario, contrasena: string) => Promise<string | null>;

const roles: { valor: Rol; label: string }[] = [
  { valor: "player", label: "Jugador" },
  { valor: "admin", label: "Administrador" },
];

function EtiquetaRol({ rol }: { rol: Rol }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs uppercase tracking-widest ${
        rol === "admin" ? "bg-forest-900 text-gold-400" : "border border-dashed border-trazo text-muted"
      }`}
    >
      {rol === "admin" ? "Admin" : "Jugador"}
    </span>
  );
}

function FormularioUsuario({
  inicial,
  onGuardar,
  onCancelar,
  textoEnvio = "Guardar cambios",
  esNuevo = false,
}: {
  inicial: Usuario;
  onGuardar: Guardar;
  onCancelar: () => void;
  textoEnvio?: string;
  esNuevo?: boolean;
}) {
  const [nombre, setNombre] = useState(inicial.nombre);
  const [correo, setCorreo] = useState(inicial.correo);
  const [rol, setRol] = useState<Rol>(inicial.rol);
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [enviando, iniciarEnvio] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const id = `usuario-${inicial.id || "nuevo"}`;

  return (
    <form
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        iniciarEnvio(async () => {
          setError(await onGuardar({ ...inicial, nombre: nombre.trim(), correo: correo.trim(), rol }, contrasena));
        });
      }}
    >
      <div>
        <label htmlFor={`${id}-nombre`} className="mb-1.5 block font-bold">Nombre</label>
        <input id={`${id}-nombre`} required value={nombre} onChange={(e) => setNombre(e.target.value)} className="campo" />
      </div>
      <div>
        <label htmlFor={`${id}-correo`} className="mb-1.5 block font-bold">Correo</label>
        <input id={`${id}-correo`} type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} className="campo" />
      </div>
      <div>
        <label htmlFor={`${id}-contrasena`} className="mb-1.5 block font-bold">
          {esNuevo ? "Contraseña" : "Nueva contraseña"}
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-contrasena`}
            type={verContrasena ? "text" : "password"}
            autoComplete="new-password"
            required={esNuevo}
            minLength={6}
            placeholder={esNuevo ? "Mínimo 6 caracteres" : "Déjala vacía para no cambiarla"}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            className="campo"
          />
          <button
            type="button"
            onClick={() => setVerContrasena((v) => !v)}
            aria-pressed={verContrasena}
            aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="flex w-12 shrink-0 items-center justify-center rounded-sm border-2 border-trazo hover:border-forest-900"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              {!verContrasena && <path d="M4 4l16 16" />}
            </svg>
          </button>
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-rol`} className="mb-1.5 block font-bold">Rol</label>
        <select id={`${id}-rol`} value={rol} onChange={(e) => setRol(e.target.value as Rol)} className="campo">
          {roles.map((r) => (
            <option key={r.valor} value={r.valor}>{r.label}</option>
          ))}
        </select>
      </div>
      {error && <p role="alert" className="font-bold text-error sm:col-span-2">{error}</p>}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
        <button type="submit" disabled={enviando} className="boton disabled:opacity-60 sm:flex-1">
          {enviando ? "Guardando…" : textoEnvio}
        </button>
        <button type="button" onClick={onCancelar} className="boton !bg-transparent !text-tinta border-2 border-trazo hover:!border-forest-900">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function UsuariosPanel({ usuarios }: { usuarios: Usuario[] }) {
  const [editando, setEditando] = useState<string | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [bloqueando, setBloqueando] = useState<string | null>(null);
  const [cambiando, iniciarCambio] = useTransition();
  const [errorBloqueo, setErrorBloqueo] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  useEffect(() => {
    if (!exito) return;
    const t = setTimeout(() => setExito(null), 4000);
    return () => clearTimeout(t);
  }, [exito]);

  const guardar: Guardar = async (u, contrasena) => {
    const r = await editarUsuario(u.id, { nombre: u.nombre, correo: u.correo, rol: u.rol, password: contrasena });
    if (r.ok) {
      setEditando(null);
      setExito(`Cambios guardados: ${u.nombre}`);
    }
    return r.ok ? null : r.error;
  };

  const agregar: Guardar = async (u, contrasena) => {
    const r = await crearUsuario({ nombre: u.nombre, correo: u.correo, rol: u.rol, password: contrasena });
    if (r.ok) {
      setAgregando(false);
      setExito(`Usuario creado: ${u.nombre}`);
    }
    return r.ok ? null : r.error;
  };

  const aplicarBloqueo = (id: string, bloqueado: boolean) =>
    iniciarCambio(async () => {
      const r = await cambiarBloqueo(id, bloqueado);
      if (r.ok) {
        setBloqueando(null);
        setErrorBloqueo(null);
        setExito(bloqueado ? "Usuario bloqueado" : "Usuario desbloqueado");
      } else {
        setErrorBloqueo(r.error);
      }
    });

  const adminsActivos = usuarios.filter((x) => x.rol === "admin" && !x.bloqueado).length;

  return (
    <section className="ticket" aria-labelledby="usuarios">
      <div className="flex items-center justify-between gap-3">
        <h2 id="usuarios" className="etiqueta !font-sans">Usuarios y roles</h2>
        {!agregando && (
          <button type="button" onClick={() => { setAgregando(true); setEditando(null); setBloqueando(null); }} className="boton !px-4 !py-2 !text-sm">
            + Agregar usuario
          </button>
        )}
      </div>
      {exito && <p role="status" className="mt-3 font-bold text-forest-700">{exito}</p>}
      {agregando && (
        <div className="fila">
          <p className="etiqueta !font-sans mb-3">Nuevo usuario</p>
          <FormularioUsuario
            inicial={{ id: "", nombre: "", correo: "", rol: "player", bloqueado: false }}
            textoEnvio="Agregar usuario"
            esNuevo
            onGuardar={agregar}
            onCancelar={() => setAgregando(false)}
          />
        </div>
      )}
      {usuarios.map((u) =>
        editando === u.id ? (
          <div key={u.id} className="fila">
            <p className="etiqueta !font-sans mb-3">Editando usuario</p>
            <FormularioUsuario inicial={u} onGuardar={guardar} onCancelar={() => setEditando(null)} />
          </div>
        ) : (
          <div key={u.id} className={`fila flex flex-col gap-3 ${u.bloqueado ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-bold">
                  {u.nombre} <EtiquetaRol rol={u.rol} />
                  {u.bloqueado && <span className="inline-block bg-error px-2 py-0.5 text-xs uppercase tracking-widest text-cream">Bloqueado</span>}
                </p>
                <p className="truncate text-sm text-muted">{u.correo}</p>
              </div>
              {bloqueando !== u.id && (
                <div className="flex shrink-0 gap-4 text-sm">
                  <button type="button" onClick={() => { setEditando(u.id); setAgregando(false); setBloqueando(null); }} className="underline underline-offset-4 hover:text-forest-700">
                    Editar
                  </button>
                  {u.bloqueado ? (
                    <button type="button" onClick={() => aplicarBloqueo(u.id, false)} disabled={cambiando} className="font-bold underline underline-offset-4 hover:text-forest-700 disabled:opacity-60">
                      Desbloquear
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={u.rol === "admin" && adminsActivos === 1}
                      title={u.rol === "admin" && adminsActivos === 1 ? "Debe quedar al menos un administrador activo" : undefined}
                      onClick={() => { setBloqueando(u.id); setEditando(null); setAgregando(false); setErrorBloqueo(null); }}
                      className="text-error underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Bloquear
                    </button>
                  )}
                </div>
              )}
            </div>
            {bloqueando === u.id && (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-bold text-error">¿Bloquear a {u.nombre}? No podrá entrar a la quiniela.</span>
                <button type="button" onClick={() => aplicarBloqueo(u.id, true)} disabled={cambiando} className="boton !bg-error !py-1.5 !text-sm disabled:opacity-60">Sí, bloquear</button>
                <button type="button" onClick={() => setBloqueando(null)} className="underline underline-offset-4">Cancelar</button>
                {errorBloqueo && <span role="alert" className="font-bold text-error">{errorBloqueo}</span>}
              </div>
            )}
          </div>
        ),
      )}
    </section>
  );
}
