# Frontend - Quiniela

Frontend de Quiniela construido con **React 19** y **Next.js 15**, utilizando **Tailwind CSS v4** con configuración CSS-first.

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js 15)
│   │   ├── layout.tsx          # Server Component raíz
│   │   ├── page.tsx            # Página de inicio
│   │   └── ...                 # Otras rutas
│   ├── components/
│   │   ├── server/             # Server Components (async, sin 'use client')
│   │   │   ├── hero.tsx
│   │   │   ├── event-card.tsx
│   │   │   └── ...
│   │   └── client/             # Client Components ('use client')
│   │       └── ...
│   ├── actions/                # Server Actions
│   │   └── ...
│   └── styles/
│       └── app.css             # Tailwind v4 CSS-first config
├── public/                     # Archivos estáticos
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🚀 Inicio Rápido

### Instalación

```bash
npm install        # desde la raíz del repo
cp frontend/.env.example frontend/.env.local   # y completa las claves de Supabase
```

Variables (`frontend/.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: públicas.
- `SUPABASE_SERVICE_ROLE_KEY`: **secreta**, solo servidor (crear/editar/bloquear usuarios desde el panel de admin).

### Base de datos

El esquema está en `supabase/migrations/` (se aplican en orden). En Supabase:
desactiva *Authentication → Sign In / Providers → Allow new users to sign up* (solo el admin crea cuentas).
El primer admin se crea en *Authentication → Users*, y se promueve con
`insert into public.profiles (id, name, role) values ('<uuid>', '<nombre>', 'admin');`.

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build

```bash
npm run build
npm start
```

## 🏗️ Stack Tecnológico

- **React 19** - Framework de UI
- **Next.js 15** - Framework full-stack
- **Supabase** - Postgres, Auth y RLS (sin backend propio)
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos CSS-first
- **Server Components** - Renderizado en servidor
- **Server Actions** - Mutaciones en servidor

## 🎨 Tailwind CSS v4 - Características Nuevas

### CSS-First Configuration

En lugar de `tailwind.config.js`, usamos `app.css` con `@theme`:

```css
@import "tailwindcss";

@theme {
  --color-primary-500: oklch(0.62 0.28 250);
  --breakpoint-custom: 1200px;
}
```

### Colores OKLCH

Colores perceptualmente uniformes y modernos:

```html
<div class="bg-primary-500">Usando OKLCH</div>
```

### Container Queries

Componentes responsivos al contenedor, no al viewport:

```html
<div class="@container">
  <div class="@lg:grid @lg:grid-cols-3">Responsive a contenedor</div>
</div>
```

## 📝 Componentes

### Server Components (`/components/server/`)

Componentes que se renderizan en el servidor:

```tsx
// hero.tsx - Server Component
export function Hero() {
  return <div>...</div>;
}
```

✅ **Ventajas:**
- Acceso directo a bases de datos
- Menos JavaScript en el cliente
- Información sensible segura

### Client Components (`/components/client/`)

Componentes con interactividad del cliente:

```tsx
'use client';
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## ⚡ Server Actions

Para mutaciones y llamadas al servidor desde formularios:

```tsx
'use client';
import { useActionState } from 'react';
import { submitPrediction } from '@/actions/predictions';

export function PredictionForm() {
  const [state, action] = useActionState(submitPrediction, null);
  
  return <form action={action}>...</form>;
}
```

## 🎯 Prácticas Recomendadas

1. **Server Components por defecto** - Usa Server Components a menos que necesites interactividad
2. **Lazy loading** - Importa componentes dinamicamente cuando sea posible
3. **Optimiza imágenes** - Usa `<Image />` de Next.js
4. **Data fetching** - Realiza fetches en Server Components
5. **Estilos modulares** - Usa las clases de Tailwind organizadas

## 📚 Recursos

- [React 19 Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com)

## 🚧 Next Steps

- [ ] Configurar autenticación
- [ ] Crear página de eventos
- [ ] Implementar predicciones
- [ ] Agregar dashboard de usuario
- [ ] Tests end-to-end

---

Última actualización: Octubre 2026
