import { redirect } from "next/navigation";
import { LoginForm } from "@/components/client/login-form";
import { getSesion } from "@/lib/sesion";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  if (await getSesion()) redirect("/partidos");
  const { motivo } = await searchParams;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-5xl text-gold-400">Entrar</h1>
      <p className="mb-8 mt-2 text-cream/70">Entra para hacer tus pronósticos.</p>
      {motivo === "sin-acceso" && (
        <p role="alert" className="mb-5 border-2 border-error px-4 py-3 text-cream">
          Tu cuenta no tiene acceso. Si crees que es un error, habla con el administrador.
        </p>
      )}
      <LoginForm />
    </div>
  );
}
