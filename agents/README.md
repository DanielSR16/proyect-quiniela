# Custom Agents (Actualizado Oct 2026)

Agentes reutilizables genéricos para tus proyectos personales con las mejores prácticas y librerías más recientes según Context7.

## 📦 Agentes Disponibles

### Backend Agent
- **Ubicación:** `/agents/backend`
- **Descripción:** Maneja desarrollo de APIs, bases de datos, autenticación y lógica del servidor
- **Framework:** Node.js + Express 5.x
- **Tecnologías:** Express 5 (Promise support), REST/GraphQL APIs, Bases de datos, JWT, OAuth, TypeScript

**Mejoras con Express 5 (2026):**
- ✅ **Async/Await middleware nativo:** Sin necesidad de `.catch(next)`, los errores se manejan automáticamente
- ✅ **Promise rejection handling:** Express 5 atrapa promesas rechazadas y las envía al middleware de errores
- ✅ **Error-handling centralizado:** Middleware con 4 argumentos `(err, req, res, next)`

**Ejemplo de middleware Express 5:**
```javascript
// ✅ Express 5 - sin .catch() necesario
app.use(async (req, res, next) => {
  req.locals.user = await getUser(req);
  next();
});

// ✅ Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});
```

**Herramientas disponibles:**
- `createAsyncRoute` - Crear endpoints con async/await (Express 5 auto-catch)
- `connectDatabase` - Conectar BD con pool y connection pooling
- `queryDatabase` - Ejecutar queries con error handling centralizado
- `setupAuth` - Autenticación JWT/OAuth2 con token refresh
- `createAsyncMiddleware` - Middleware async con error propagation automático
- `setupErrorHandling` - Middleware central (4-arg pattern) para todos los errores
- `validateInput` - Validación con schemas (Zod, Yup)
- `setupSecurityMiddleware` - CORS, helmet, rate limiting, CSRF protection

### Frontend Agent
- **Ubicación:** `/agents/frontend`
- **Descripción:** Maneja desarrollo de UI, estado, estilos y lógica del cliente
- **Frameworks:** React 19 (Server Components + Client Components)
- **Tecnologías:** React 19, TypeScript, Tailwind CSS v4, Server Components, Progressive Enhancement

**Mejoras con React 19 (2026):**
- ✅ **Server Components:** Renderiza en servidor, menos JavaScript en el cliente
- ✅ **useActionState:** Hook para formularios con progressive enhancement
- ✅ **Server Functions ("use server"):** Llama funciones del servidor directamente desde el cliente

**Ejemplo React 19 - Formulario con Server Component:**
```jsx
// server-component.js (Server Component)
import { UserContext } from './user-context';

export async function Layout({ children }) {
  const currentUser = await getCurrentUser();
  
  // React 19.3+ - Renderizar context directamente sin Provider wrapper
  return (
    <UserContext value={currentUser}>
      {children}
    </UserContext>
  );
}

// form.jsx (Client Component)
'use client';
import { useActionState } from 'react';
import { signUpNewUser } from './api';

export default function SignupForm() {
  async function signup(prevState, formData) {
    'use server';
    const email = formData.get('email');
    try {
      await signUpNewUser(email);
      return { success: true };
    } catch (err) {
      return { error: err.toString() };
    }
  }
  
  const [state, signupAction] = useActionState(signup, null);
  
  return (
    <form action={signupAction}>
      <input name="email" placeholder="tu@email.com" />
      <button>Sign up</button>
      {state?.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}
```

**Herramientas disponibles:**
- `createServerComponent` - Generar Server Components (async, sin "use client")
- `createClientComponent` - Client Components con "use client" directive
- `createServerAction` - Server Actions para formularios y mutaciones
- `createFormWithActionState` - Formularios con useActionState y progressive enhancement
- `setupStateManagement` - Zustand/Jotai (optimizados para Server Components)
- `applyTailwindV4Styles` - Estilos con CSS-first config (no tailwind.config.js)
- `setupAppRouter` - Configurar App Router (Next.js 13+)
- `createResponsiveLayout` - Layouts con container queries y @container
- `optimizeServerData` - Data fetching en Server Components sin overloading del cliente

## 🎨 Tailwind CSS v4 - Nuevas características (2026)

**CSS-First Configuration:**
```css
/* app.css - Reemplaza tailwind.config.js */
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --color-brand-500: oklch(0.84 0.18 117.33);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
}
```

**Colores OKLCH modernos:**
```html
<!-- Mejores colores perceptualmente uniformes -->
<div class="bg-[oklch(0.84_0.18_117.33)]">Color OKLCH</div>
```

**Container Queries:**
```html
<div class="@container">
  <div class="@lg:grid @lg:grid-cols-2">Responsive a contenedor</div>
</div>
```

**Vite Plugin (mejor performance):**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
});
```

## 🚀 Cómo Usar

### En un proyecto nuevo:

```bash
# 1. Importar el agente
import { BackendAgent } from '@agents/backend'
// o
import { FrontendAgent } from '@agents/frontend'

# 2. Usar las herramientas del agente - Express 5 Async Example
BackendAgent.tools.createAsyncRoute({
  method: 'GET',
  path: '/api/users',
  handler: async (req, res) => {
    // Sin .catch(next) necesario - Express 5 lo maneja automáticamente
    const users = await db.query('SELECT * FROM users');
    res.json(users);
  }
})

# 3. Frontend - React 19 Server Component Example
FrontendAgent.tools.createServerComponent({
  name: 'UserList',
  async: true, // Server Component
  source: async () => {
    const users = await db.query('SELECT * FROM users');
    return <div>{users.map(u => <p>{u.name}</p>)}</div>;
  }
})
```

### Estructura recomendada para tus proyectos (2026):

```
mi-proyecto/
├── agents/
│   ├── backend/
│   ├── frontend/
│   └── README.md (este archivo)
├── backend/
│   ├── src/
│   │   ├── middleware/           # Express 5 async middleware
│   │   ├── routes/               # Rutas con async/await
│   │   ├── controllers/
│   │   ├── services/
│   │   └── errors/               # Error handling centralizado
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                  # App Router (Next.js)
│   │   │   ├── layout.tsx        # Server Component root
│   │   │   ├── page.tsx          # Server Component
│   │   │   └── [id]/
│   │   ├── components/
│   │   │   ├── server/           # Server Components
│   │   │   └── client/           # 'use client' components
│   │   ├── actions/              # Server Actions
│   │   └── styles/               # app.css con @theme
│   └── package.json
├── tailwind.css                   # CSS-first config (Tailwind v4)
└── package.json
```

## 📝 Características Genéricas

Ambos agentes están diseñados para ser:
- **Genéricos:** Sin dependencias de frameworks específicos
- **Modulares:** Usa solo las herramientas que necesites
- **Reutilizables:** Copia la carpeta `agents/` a cualquier proyecto
- **Escalables:** Puedes extender las herramientas según necesites
- **Actualizados:** Basados en documentación oficial de Context7 (Oct 2026)

## ⚡ Prácticas Recomendadas (Context7 2026)

### Backend - Express 5 Best Practices

✅ **DO:**
```javascript
// Middleware async - Express 5 maneja errores automáticamente
app.use(async (req, res, next) => {
  req.user = await getUser(req.headers.auth);
  next(); // Error en getUser? Express lo atrapa automáticamente
});

// Error handling centralizado
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});
```

❌ **DON'T:**
```javascript
// Viejo patrón - no es necesario con Express 5
app.use((req, res, next) => {
  getUser(req.headers.auth)
    .then(user => { req.user = user; next(); })
    .catch(next); // Ya no es necesario
});
```

### Frontend - React 19 Best Practices

✅ **Server Components por defecto:**
```jsx
// Renderiza en servidor - menos JS en cliente
export async function UserList() {
  const users = await fetch('...').then(r => r.json());
  return <div>{users.map(u => <User key={u.id} user={u} />)}</div>;
}
```

✅ **Client Components solo cuando sea necesario:**
```jsx
'use client'; // Solo cuando necesites interactividad
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

✅ **useActionState para formularios:**
```jsx
'use client';
import { useActionState } from 'react';

export function Form() {
  async function submit(prevState, formData) {
    'use server';
    // Validación y procesamiento del servidor
    return { success: true };
  }

  const [state, action] = useActionState(submit, null);
  
  return <form action={action}>...</form>;
}
```

### Styling - Tailwind CSS v4

✅ **CSS-first @theme directive:**
```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.6 0.2 250);
  --breakpoint-tablet: 768px;
}
```

✅ **Container queries para componentes responsivos:**
```html
<div class="@container">
  <div class="@lg:grid @lg:grid-cols-3">
    <!-- Responde al tamaño del contenedor, no del viewport -->
  </div>
</div>
```

## 📚 Fuentes de Documentación (Context7)

- **Express 5:** Async middleware, Promise support, error handling
- **React 19:** Server Components, useActionState, Server Functions
- **Tailwind CSS v4:** CSS-first config, OKLCH colors, container queries
- **Actualización:** Octubre 2026 - Usa `context7-mcp` para docs actualizadas

## 🔧 Personalización

Para agregar nuevas herramientas a un agente:

1. Abre el archivo `agent.js` del agente
2. Agrega una nueva entrada en el objeto `tools`
3. Define `description` y `params`



Ejemplo:
```javascript
newTool: {
  description: "Lo que hace esta herramienta",
  params: {
    param1: "tipo",
    param2: "tipo"
  }
}
```

## 🔗 Recursos por Librería

### Express 5 (Backend)
- **Library ID:** `/websites/expressjs`
- **Docs:** https://expressjs.com
- **Cambios principales:** Promise support, async middleware, error handling automático
- **Migración desde v4:** Los middleware async ahora manejan errores automáticamente

### React 19 (Frontend)
- **Library ID:** `/websites/react_dev`
- **Docs:** https://react.dev
- **Cambios principales:** Server Components, useActionState, Server Functions
- **Versión mínima recomendada:** React 19.2.0+

### Tailwind CSS v4 (Styling)
- **Library ID:** `/websites/deepwiki_tailwindlabs_tailwindcss_com`
- **Docs:** https://tailwindcss.com
- **Cambios principales:** CSS-first config, @theme directive, OKLCH colors
- **Instalación:** `npx @tailwindcss/upgrade` para migrar desde v3

### Actualizar documentación
```bash
# Actualizar esta documentación con Context7
# Usa: mcp__context7__resolve-library-id + mcp__context7__query-docs
# Para la librería que necesites información actualizada
```

## 📂 Próximos Pasos

1. **Revisar estructura:** Adapta tus proyectos a la nueva estructura con `app/` para frontend
2. **Migrar agentes:** Actualiza tus agentes backend a async/await (Express 5)
3. **Implementar Server Components:** Empieza con Server Components por defecto en React
4. **Tailwind v4:** Si usas Tailwind, migra a v4 con CSS-first config
5. **Usar Context7:** Para documentación actualizada en nuevas librerías

## 🤖 Context7 Integration

Este archivo fue generado con información de Context7. Para mantenerlo actualizado:

```bash
# Usa Claude Code con Context7 para:
# 1. Resolver la librería: /resolve-library-id
# 2. Consultar documentación: /query-docs con libraryId
# 3. Aplicar mejores prácticas actuales

# Comando recomendado:
/context7-mcp query "latest best practices for Express 5 middleware"
```

¡Listo para usar con las mejores prácticas de 2026! 🚀
