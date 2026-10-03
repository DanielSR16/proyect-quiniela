# 📋 Quiniela - Especificaciones del Proyecto

**Última actualización:** 3 de Octubre, 2026

## 🎯 Descripción General

Plataforma de predicciones deportivas para la **Liga MX** (fútbol mexicano) dirigida a usuarios de 35 a 70+ años. Los usuarios predicen resultados de partidos y ganan puntos por aciertos.

## 👥 Audiencia Objetivo

- **Rango de edad:** 35 a 70+ años
- **Nivel técnico:** Bajo a medio (interfaz muy intuitiva)
- **Dispositivos:** Mobile, tablet, computadora (RESPONSIVO)

## 🔐 Autenticación

- **Login simple:** Solo nombre de usuario + contraseña
- **Sin recuperación por email** (por ahora)
- **Control de acceso:**
  - Usuarios normales: Ver predicciones y partidos
  - Admin: Acceso a pestaña extra de administración

## ⚽ Gestión de Partidos

### ⚠️ **IMPORTANTE - SIN API EXTERNA**
- **Datos de partidos:** Se llenan **manualmente** (NO hay API externa)
- **Equipos:** El usuario agrega los equipos que quiera (NO está limitado a Liga MX oficial)
- El admin debe poder cargar/editar:
  - Equipos que juegan
  - Fecha y hora del partido
  - **CIERRE DE PREDICCIONES:** Cuando el admin pone una hora de partido, a partir de esa hora NO se pueden hacer ni modificar predicciones
  - Resultado final (después que se juega)
  - Estado del partido (próximo, en vivo, finalizado)

## 🎮 Sistema de Predicciones

Los usuarios seleccionan el resultado exacto de cada partido (ej: 2-1, 3-0, etc.)

### ⏰ **Cierre de Predicciones**
- El admin establece la hora del partido
- **DESPUÉS DE ESA HORA:** No se pueden hacer ni modificar predicciones
- Las predicciones realizadas antes quedan bloqueadas

### 🏆 Sistema de Puntuación

| Resultado | Puntos | Condición |
|-----------|--------|-----------|
| ✅ Exacto | 5 pts | Resultado completo correcto (ej: 2-1) |
| 🟡 Parcial | 3 pts | Ganador correcto pero score diferente (ej: predijiste 1-0, resultó 2-1) |
| ❌ Incorrecto | 0 pts | Ni el ganador ni el score son correctos |

**Ejemplo:**
- Partido: Real Madrid vs Monterrey
- Resultado real: 3-2 (gana Real Madrid)
- Tu predicción: 1-0 (gana Real Madrid)
  - → **3 puntos** (acertaste el ganador pero no el score)
- Otra predicción: 3-2 (exacto)
  - → **5 puntos** (resultado exacto)
- Otra predicción: 1-2 (gana Monterrey)
  - → **0 puntos** (ganador incorrecto)

## 👨‍💼 Panel de Administración

- **Acceso:** Solo para usuarios admin (pestaña extra en la navbar)
- **Funcionalidades:**
  - Crear/editar partidos (teams, fecha, hora)
  - Llenar resultados cuando termina el partido
  - Ver todas las predicciones de un partido
  - Gestionar estado de partidos
  - Ver estadísticas de usuarios

## 📊 Ranking Global

- **Único ranking global** (no se reinicia, acumulativo)
- **Visible para todos los usuarios** - Otros usuarios pueden ver:
  - Posición de cada usuario
  - Puntos totales
  - Las predicciones realizadas por otros usuarios

## 📊 Funcionalidades Principales

### Para Usuarios
- [x] Login/Logout
- [x] Ver próximos partidos
- [x] Hacer predicciones (antes de la hora de cierre)
- [x] Ver predicciones realizadas
- [x] Ver puntuación personal
- [x] Ver rankings (ranking global visible)
- [x] Historial de predicciones (con aciertos/fallos)

### Para Admin
- [x] Crear partido nuevo
- [x] Editar partido (incluyendo hora de cierre)
- [x] Ingresar resultado final
- [x] Ver todas las predicciones de un partido
- [x] Ver estadísticas de usuarios
- [x] Gestionar estado de partidos

## 📱 Pantallas (Fase 1)

1. **Login** - Nombre de usuario + Contraseña
2. **Próximos Partidos** - Lista de partidos sin jugar, opción de predecir
3. **Dashboard/Perfil** - Puntuación personal, historial de predicciones
4. **Admin Panel** - Crear/editar partidos, resultados, ver predicciones

## 🗄️ Estructura de Datos

### Usuario
```javascript
{
  id: número,
  nombre: string,
  contraseña: string (hasheada),
  rol: 'user' | 'admin',
  puntosTotales: number,
  fechaCreacion: date
}
```

### Partido
```javascript
{
  id: número,
  equipoLocal: string,
  equipoVisitante: string,
  fecha: datetime,
  horaPartido: datetime,        // Hora en que cierra la predicción
  resultadoLocal: number | null, // null si no ha terminado
  resultadoVisitante: number | null,
  estado: 'proximo' | 'en_vivo' | 'finalizado'
}
```

### Predicción
```javascript
{
  id: número,
  usuarioId: number,
  partidoId: number,
  prediccionLocal: number,     // Ej: 1
  prediccionVisitante: number, // Ej: 0
  puntos: number | null,       // null si no se ha calculado (partido no terminado)
  fechaPrediccion: date,
  bloqueada: boolean           // true después de la hora del partido
}
```

## 🎨 Requisitos de Interfaz

- ✅ **Responsivo:** Mobile first (35-70 años necesitan textos grandes)
- ✅ **Simple:** Interfaz intuitiva, sin complejidades
- ✅ **Contraste:** Colores claros y legibles para usuarios mayores
- ✅ **Botones grandes:** Fáciles de clickear
- ✅ **Nombres claros:** Etiquetas explícitas

## 🔄 Flujo Principal

1. **Usuario abre app** → Login (nombre + contraseña)
2. **Dashboard/Home** → Ver próximos partidos
3. **Hace predicción** → Selecciona marcador (botones con números)
4. **Ve puntuación** → Dashboard con puntos totales e historial
5. **Ve ranking** → Compararse con otros usuarios (predicciones visibles)

## 📅 Frecuencia

- **Partidos semanales** (aproximadamente)
- Admin agrega manualmente los partidos de la semana

## ⚙️ Stack Tecnológico (Actual)

- **Frontend:** React 19 + Next.js 14 + Tailwind CSS v4 ✅
- **Backend:** A definir (Express 5 + Node.js - futuro)
- **Base de datos:** A definir - SQLite (dev) o PostgreSQL (prod)
- **Auth:** Session-based simple (nombre + contraseña)

## 🚀 Fase Actual: Frontend

Focus: Crear interfaz completa y funcional

1. [x] Estructura base + componentes iniciales
2. [ ] Página de login
3. [ ] Página de próximos partidos con predictor
4. [ ] Dashboard con historial
5. [ ] Ranking visible
6. [ ] Admin panel (crear/editar partidos)
7. [ ] Mock data para testing

## 📝 Decisiones Pendientes

- **Base de datos:** SQLite vs PostgreSQL
- **Hosting/Servidor:** Dónde va a vivir
- **Deploy:** Local network vs Internet

---

**Notas importantes:**
- Los datos de partidos NO vienen de API externa
- El admin llena todo manualmente
- Equipos: El usuario define cuáles quiere (flexible)
- Sistema de puntuación: 5 exacto, 3 ganador correcto, 0 incorrecto
- Predicciones se cierran en la hora que el admin especifique
- Ranking global visible para todos
- Otras predicciones visibles para todos (leaderboard)
- Audiencia: 35-70 años (interfaz muy amigable, botones grandes)
