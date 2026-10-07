import { redirect } from "next/navigation";
import { LoginForm } from "@/components/client/login-form";
import { getSesion } from "@/lib/sesion";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  if (await getSesion()) redirect("/partidos");
  const { motivo } = await searchParams;

  return (
    <div className="w-full">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gold-400 text-forest-900 shadow-lg shadow-black/30">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="m12 8 3.5 2.5-1.3 4h-4.4l-1.3-4z" />
          </svg>
        </span>
        <h1 className="font-display text-4xl tracking-wide text-gold-400">QUINIELA LIGA MX</h1>
        <p className="mt-2 text-cream/70">Inicia sesión para hacer tus pronósticos</p>
      </div>
      {motivo === "sin-acceso" && (
        <p role="alert" className="mb-5 rounded-2xl border border-error bg-error/20 px-4 py-3 text-sm text-cream">
          Tu sesión se cerró: abriste sesión en otro dispositivo o tu cuenta no tiene acceso. Si crees que es un error, habla con el administrador.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
