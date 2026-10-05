import type { Metadata, Viewport } from "next";
import { Anton, Space_Mono } from "next/font/google";
import { Nav } from "@/components/client/nav";
import "@/styles/app.css";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const space = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Quiniela Liga MX",
  description: "Predice los resultados de la Liga MX y compite con tus amigos",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${space.variable}`}>
      <body>
        <header className="border-b-2 border-dashed border-cream/40">
          <div className="mx-auto flex max-w-4xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:gap-8">
            <a href="/partidos" className="font-display text-3xl leading-none tracking-wide text-gold-400">
              QUINIELA LIGA MX
            </a>
            <Nav />
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-5 pb-28 pt-8 sm:pb-12">{children}</main>
      </body>
    </html>
  );
}
