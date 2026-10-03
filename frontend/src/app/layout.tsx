import type { Metadata, Viewport } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "@/styles/app.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const source = Source_Sans_3({ subsets: ["latin"], variable: "--font-source" });

export const metadata: Metadata = {
  title: "Quiniela Liga MX",
  description: "Predice los resultados de la Liga MX y compite con tus amigos",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const enlaces = [
  ["/partidos", "Partidos"],
  ["/dashboard", "Mis puntos"],
  ["/ranking", "Ranking"],
  ["/admin", "Admin"],
  ["/login", "Entrar"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${source.variable}`}>
      <body>
        <header className="border-b-4 border-gold-500 bg-primary-600 text-card">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <a href="/partidos" className="font-display text-3xl font-bold">
              Quiniela <span className="text-gold-400">Liga MX</span>
            </a>
            <nav className="flex flex-wrap gap-x-6 gap-y-1 text-lg font-semibold">
              {enlaces.map(([href, label]) => (
                <a key={href} href={href} className="hover:text-gold-400">
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>

        <footer className="border-t border-line py-6 text-center text-base text-ink/70">
          Quiniela Liga MX · 2026
        </footer>
      </body>
    </html>
  );
}
