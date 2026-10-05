import { Cabecera } from "@/components/cabecera";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cabecera />
      <main className="mx-auto max-w-4xl px-5 pb-12 pt-8">{children}</main>
    </>
  );
}
