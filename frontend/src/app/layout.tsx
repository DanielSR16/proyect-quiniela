import type { Metadata, Viewport } from "next";
import "@/styles/app.css";

export const metadata: Metadata = {
  title: "Quiniela Liga MX",
  description: "Predice los resultados de la Liga MX y compite con tus amigos",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="container-fluid flex items-center justify-between py-4">
              <div className="text-2xl font-bold text-primary-600">
                ⚽ Quiniela
              </div>
              <nav className="flex flex-wrap gap-x-6 gap-y-2 text-lg font-semibold">
                {[
                  ["/", "Inicio"],
                  ["/partidos", "Partidos"],
                  ["/dashboard", "Mis puntos"],
                  ["/ranking", "Ranking"],
                  ["/admin", "Admin"],
                  ["/login", "Entrar"],
                ].map(([href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="text-gray-700 hover:text-primary-600 dark:text-gray-300"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          {/* Main Content */}
          <main className="container-fluid py-12">{children}</main>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-800 dark:bg-gray-900">
            <div className="container-fluid text-center text-sm text-gray-600 dark:text-gray-400">
              <p>© 2026 Quiniela. Todos los derechos reservados.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
