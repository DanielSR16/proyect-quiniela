"use client";

import { useState } from "react";
import { infoEquipo, logosDisponibles, slugEquipo } from "@/lib/equipos";

export function Escudo({ nombre, className = "h-8 w-8" }: { nombre: string; className?: string }) {
  const slug = slugEquipo(nombre);
  const [sinImagen, setSinImagen] = useState(!logosDisponibles.includes(slug));
  const { siglas, fondo, texto } = infoEquipo(nombre);

  if (!sinImagen) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/logos/${slug}.png`}
        alt=""
        onError={() => setSinImagen(true)}
        className={`${className} shrink-0 object-contain`}
      />
    );
  }

  return (
    <svg viewBox="0 0 40 46" className={`${className} shrink-0`} aria-hidden="true">
      <path d="M20 1.5 37 7v16c0 11-7.5 18-17 21.5C10.5 41 3 34 3 23V7z" fill={fondo} stroke="#1d1b14" strokeWidth="2" strokeLinejoin="round" />
      <text x="20" y="27" textAnchor="middle" fontSize="12" fontWeight="700" fill={texto} fontFamily="var(--font-sans)">
        {siglas}
      </text>
    </svg>
  );
}

export function Equipo({
  nombre,
  className = "",
  claseNombre = "",
  claseEscudo,
}: {
  nombre: string;
  className?: string;
  claseNombre?: string;
  claseEscudo?: string;
}) {
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      <Escudo nombre={nombre} className={claseEscudo} />
      <span className={`font-bold ${claseNombre}`}>{nombre}</span>
    </span>
  );
}
