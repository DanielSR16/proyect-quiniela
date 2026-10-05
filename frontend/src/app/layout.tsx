import type { Metadata, Viewport } from "next";
import { Anton, Space_Mono } from "next/font/google";
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
      <body>{children}</body>
    </html>
  );
}
