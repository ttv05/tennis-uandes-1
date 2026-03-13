# Tenis Uandes - Documentación Técnica

## 📋 Descripción General

**Tenis Uandes** es una aplicación móvil React Native con Expo que optimiza la coordinación de entrenamientos para equipos universitarios de tenis. La app utiliza:

- **OCR con LLM** para analizar calendarios de clase
- **Algoritmo de optimización** para sugerir mejores horarios de entrenamiento
- **Base de datos MySQL** para persistencia de datos
- **API tRPC** para comunicación cliente-servidor

---

## 🏗️ Arquitectura

### Stack Tecnológico

```
Frontend (Mobile)
├── React Native 0.81
├── Expo SDK 54
├── TypeScript 5.9
├── NativeWind (Tailwind CSS)
├── React Router 6 (Expo Router)
└── TanStack Query (React Query)

Backend (Server)
├── Express.js
├── tRPC (API)
├── Drizzle ORM
├── MySQL Database
└── LLM Integration (OCR)

Infrastructure
├── S3 Storage (file uploads)
├── OAuth Authentication
└── Session Management
```

### Estructura de Carpetas

```
tenis-uandes/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx            # Home screen
│   │   ├── calendar.tsx         # Calendar view
│   │   ├── profile.tsx          # User profile
│   │   ├── gender-selection.tsx # First-time setup
│   │   └── upload-calendar.tsx  # Calendar upload
│   ├── _layout.tsx              # Root layout
│   └── oauth/callback.tsx       # OAuth callback
├── server/                       # Backend API
│   ├── _core/
│   │   ├── index.ts            # Server entry point
│   │   ├── trpc.ts             # tRPC setup
│   │   ├── llm.ts              # LLM integration
│   │   └── auth.ts             # Authentication
│   ├── routers.ts              # tRPC routes
│   ├── db.ts                   # Database functions
│   ├── ocr-processor.ts        # OCR processing
│   └── training-optimizer.ts   # Schedule optimization
├── drizzle/
│   ├── schema.ts               # Database schema
│   └── migrations/             # Database migrations
├── components/
│   ├── screen-container.tsx    # SafeArea wrapper
│   ├── ui/
│   │   └── icon-symbol.tsx     # Icon mappings
│   └── haptic-tab.tsx          # Haptic feedback
├── hooks/
│   ├── use-auth.ts             # Auth state
│   ├── use-colors.ts           # Theme colors
│   └── use-color-scheme.ts     # Dark/light mode
├── lib/
│   ├── trpc.ts                 # tRPC client
│   ├── utils.ts                # Utilities
│   └── _core/
│       ├── theme.ts            # Theme provider
│       └── auth.ts             # Auth types
└── assets/
    └── images/                 # App icons & splash
```

---

## 🗄️ Base de Datos

### Esquema

```sql
-- Users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  role ENUM('player', 'captain', 'admin') DEFAULT 'player',
  teamId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams
CREATE TABLE teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability (time blocks)
CREATE TABLE availability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  dayOfWeek INT (0-4 for Mon-Fri),
  startTime VARCHAR(5) (HH:MM format),
  endTime VARCHAR(5),
  isAvailable BOOLEAN,
  source ENUM('ocr', 'manual'),
  weekNumber INT,
  year INT,
  createdAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Calendar Uploads
CREATE TABLE calendar_uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  imageUrl VARCHAR(255),
  weekNumber INT,
  year INT,
  ocrResult JSON,
  createdAt TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Training Sessions
CREATE TABLE training_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teamId INT NOT NULL,
  dayOfWeek INT,
  startTime VARCHAR(5),
  endTime VARCHAR(5),
  gender ENUM('male', 'female', 'mixed'),
  availablePlayerCount INT,
  status ENUM('suggested', 'approved', 'cancelled'),
  weekNumber INT,
  year INT,
  createdAt TIMESTAMP,
  FOREIGN KEY (teamId) REFERENCES teams(id)
);

-- Training Confirmations
CREATE TABLE training_confirmations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trainingSessionId INT NOT NULL,
  userId INT NOT NULL,
  status ENUM('confirmed', 'cancelled'),
  confirmedAt TIMESTAMP,
  FOREIGN KEY (trainingSessionId) REFERENCES training_sessions(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## 🔌 API Endpoints (tRPC)

### Authentication

```typescript
// Set gender (first login)
auth.setGender({ gender: 'male' | 'female' })

// Get current user
auth.me()

// Logout
auth.logout()
```

### Availability

```typescript
// Save availability blocks
availability.save({
  weekNumber: number,
  year: number,
  blocks: Array<{
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isAvailable: boolean,
    source: 'ocr' | 'manual'
  }>
})

// Get user availability
availability.get({
  weekNumber: number,
  year: number
})

// Delete availability
availability.delete({
  weekNumber: number,
  year: number
})
```

### Calendar OCR

```typescript
// Process calendar image
calendar.processOCR({
  imageUrl: string,
  weekNumber: number,
  year: number
})
// Returns: { uploadId, blocks, confidence, message }
```

### Optimization

```typescript
// Get training suggestions
optimization.getSuggestions({
  weekNumber: number,
  year: number
})
// Returns: Array<TrainingSlot>

// Generate training sessions (captain only)
optimization.generateSessions({
  weekNumber: number,
  year: number,
  count: number
})
// Returns: { sessionIds, count }
```

### Training Sessions

```typescript
// Create training session
sessions.create({
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  gender: 'male' | 'female' | 'mixed'
})

// Approve session (captain)
sessions.approve({ sessionId: number })

// Reject session (captain)
sessions.reject({ sessionId: number })

// Get team sessions
sessions.getTeamSessions({
  weekNumber: number,
  year: number
})
```

### Confirmations

```typescript
// Confirm attendance
confirmations.confirm({ trainingSessionId: number })

// Cancel attendance
confirmations.cancel({ trainingSessionId: number })
```

---

## 🧠 Algoritmo de Optimización

### Proceso

1. **Recopilación de Datos**
   - Obtener disponibilidad de todos los jugadores
   - Separar por género

2. **Generación de Candidatos**
   - Crear slots horarios (8:00-20:00, cada hora)
   - Para cada slot, contar jugadores disponibles

3. **Cálculo de Puntuación**
   ```
   score = (availableCount / totalCount) * 100 + (availableCount / 10) * 20
   ```

4. **Ranking**
   - Ordenar por puntuación descendente
   - Retornar top 10 sugerencias

5. **Priorización por Género**
   - Entrenamientos hombre-hombre (si ≥2 disponibles)
   - Entrenamientos mujer-mujer (si ≥2 disponibles)
   - Entrenamientos mixtos (si ≥1 de cada género)

---

## 🤖 Procesamiento OCR

### Flujo

1. **Captura de Imagen**
   - Usuario toma foto o selecciona de galería
   - Imagen se convierte a base64

2. **Envío al LLM**
   - Se envía a `invokeLLM()` con prompt específico
   - LLM retorna JSON con bloques detectados

3. **Validación**
   - Verificar formato de tiempos (HH:MM)
   - Validar rango de días (0-4 para Lun-Vie)
   - Filtrar bloques inválidos

4. **Almacenamiento**
   - Guardar en tabla `calendar_uploads`
   - Crear registros en `availability`

---

## 🚀 Desarrollo Local

### Requisitos

- Node.js 18+
- pnpm 9+
- MySQL 8+

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd tenis-uandes

# Instalar dependencias
pnpm install

# Configurar base de datos
pnpm db:push

# Iniciar desarrollo
pnpm dev
```

### Variables de Entorno

```env
# .env.local
DATABASE_URL=mysql://user:password@localhost:3306/tenis_uandes
NODE_ENV=development
```

### Comandos Útiles

```bash
# Iniciar servidor + Metro bundler
pnpm dev

# Solo servidor backend
pnpm dev:server

# Solo Metro bundler (Expo)
pnpm dev:metro

# Verificar tipos TypeScript
pnpm check

# Ejecutar tests
pnpm test

# Build para producción
pnpm build

# Generar código QR para Expo Go
pnpm qr
```

---

## 📱 Testing

### Pruebas Unitarias

```bash
# Ejecutar tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

### Testing Manual

1. **iOS**: Usar Expo Go o simulador
2. **Android**: Usar Expo Go o emulador
3. **Web**: `http://localhost:8081`

### Flujos Críticos a Probar

- [ ] Autenticación OAuth
- [ ] Selección de género (primer login)
- [ ] Carga de calendario
- [ ] Procesamiento OCR
- [ ] Visualización de entrenamientos
- [ ] Confirmación de asistencia
- [ ] Rol de capitán (aprobar/rechazar)

---

## 🔐 Seguridad

### Autenticación

- OAuth con Manus (servidor)
- Sesiones con cookies seguras
- Tokens JWT para API

### Autorización

- Verificación de rol en cada endpoint
- Solo capitanes pueden generar sesiones
- Usuarios solo ven su propia disponibilidad

### Datos Sensibles

- Contraseñas: Hasheadas con bcrypt
- Tokens: Almacenados en cookies HttpOnly
- Imágenes: Almacenadas en S3 privado

---

## 📦 Deployment

### Build para iOS

```bash
# Generar APK/IPA
eas build --platform ios

# Publicar en App Store
eas submit --platform ios
```

### Build para Android

```bash
# Generar APK
eas build --platform android

# Publicar en Google Play
eas submit --platform android
```

---

## 🐛 Debugging

### Logs del Servidor

```bash
# Ver logs en tiempo real
tail -f server.log

# Nivel de log
LOG_LEVEL=debug pnpm dev:server
```

### Logs del Cliente

```typescript
// En componentes React
console.log('[FeatureName]', message);

// En tRPC procedures
console.error('[OCR] Error processing calendar:', error);
```

### Herramientas

- **React DevTools**: Inspeccionar componentes
- **Network Tab**: Ver requests tRPC
- **Storage**: Ver AsyncStorage/cookies

---

## 📚 Referencias

- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [NativeWind](https://www.nativewind.dev)

---

## 📝 Notas Importantes

1. **Migraciones de BD**: Ejecutar `pnpm db:push` después de cambios en schema
2. **Tipos TypeScript**: Mantener sincronizados cliente-servidor
3. **OCR**: El LLM requiere imágenes claras y bien iluminadas
4. **Performance**: Usar React Query para caching de datos
5. **Responsive**: Diseño mobile-first con NativeWind

---

## 🤝 Contribuir

1. Crear rama feature: `git checkout -b feature/nombre`
2. Hacer cambios y tests
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nombre`
5. Crear Pull Request

---

**Última actualización**: Marzo 13, 2026
