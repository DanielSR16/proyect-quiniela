import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/client/login-form";
import { getSesion } from "@/lib/sesion";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ motivo?: string }> }) {
  if (await getSesion()) redirect("/partidos");
  const { motivo } = await searchParams;

  return (
    <div className="w-full">
      <div className="mb-10 flex flex-col items-center text-center">
        <Image
          src="/logo.jpg"
          alt=""
          width={640}
          height={640}
          priority
          className="mb-2 h-60 w-60 object-cover [mask-image:radial-gradient(closest-side,#000_82%,transparent)]"
        />
        <h1 className="sr-only">Quinieleros Pinola</h1>
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
