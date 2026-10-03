// Ejemplo de cómo usar los agentes en un proyecto

import { BackendAgent } from './backend/agent.js';
import { FrontendAgent } from './frontend/agent.js';

// ============================================
// BACKEND AGENT - Configurar API
// ============================================

// 1. Crear rutas de API
console.log('🔧 Backend Agent - Creando rutas...');
BackendAgent.tools.createRoute({
  method: 'GET',
  path: '/api/users',
  handler: 'getAllUsers'
});

BackendAgent.tools.createRoute({
  method: 'POST',
  path: '/api/users',
  handler: 'createUser'
});

BackendAgent.tools.createRoute({
  method: 'GET',
  path: '/api/users/:id',
  handler: 'getUserById'
});

// 2. Conectar base de datos
BackendAgent.tools.connectDatabase({
  type: 'postgresql',
  config: {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'user',
    password: 'password'
  }
});

// 3. Configurar autenticación
BackendAgent.tools.setupAuth({
  type: 'jwt',
  config: {
    secret: 'tu-secret-key',
    expiresIn: '24h'
  }
});

// 4. Crear middleware de validación
BackendAgent.tools.createMiddleware({
  name: 'validateInput',
  logic: 'validates incoming request data'
});

// 5. Configurar manejo de errores
BackendAgent.tools.setupErrorHandling({
  logLevel: 'info',
  storage: 'file'
});

// ============================================
// FRONTEND AGENT - Crear interfaz
// ============================================

console.log('\n🎨 Frontend Agent - Creando componentes...');

// 1. Configurar routing
FrontendAgent.tools.setupRouting({
  library: 'react-router',
  routes: [
    { path: '/', component: 'Home' },
    { path: '/users', component: 'UsersList' },
    { path: '/users/:id', component: 'UserDetail' },
    { path: '/admin', component: 'AdminPanel', protected: true }
  ]
});

// 2. Crear componentes
FrontendAgent.tools.createComponent({
  framework: 'react',
  name: 'UsersList',
  type: 'functional',
  features: ['hooks', 'useEffect', 'useState']
});

FrontendAgent.tools.createComponent({
  framework: 'react',
  name: 'UserForm',
  type: 'functional',
  features: ['form-handling', 'validation', 'submit']
});

// 3. Configurar estado global
FrontendAgent.tools.setupStateManagement({
  type: 'zustand',
  structure: {
    users: [],
    currentUser: null,
    isLoading: false
  }
});

// 4. Integrar API
FrontendAgent.tools.integrateAPI({
  client: 'axios',
  baseURL: 'http://localhost:3000/api',
  interceptors: [
    { type: 'request', logic: 'add-token' },
    { type: 'response', logic: 'handle-errors' }
  ]
});

// 5. Aplicar estilos
FrontendAgent.tools.applyStyles({
  approach: 'tailwind',
  config: {
    theme: 'light-dark',
    responsive: true
  }
});

// 6. Crear formulario con validación
FrontendAgent.tools.createForm({
  framework: 'react',
  fields: [
    { name: 'email', type: 'email', required: true },
    { name: 'password', type: 'password', required: true },
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true }
  ],
  validation: 'zod-schema'
});

// 7. Generar tests
FrontendAgent.tools.generateTests({
  framework: 'vitest',
  type: 'unit'
});

// 8. Optimizar rendimiento
FrontendAgent.tools.optimizePerformance({
  techniques: [
    'code-splitting',
    'lazy-loading',
    'memoization',
    'image-optimization'
  ]
});

// ============================================
// SUMMARY
// ============================================

console.log('\n✅ Agentes configurados correctamente!');
console.log('\n📋 Backend Agent Capabilities:');
console.log(BackendAgent.capabilities);
console.log('\n📋 Frontend Agent Capabilities:');
console.log(FrontendAgent.capabilities);
