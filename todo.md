# Tenis Uandes - Project TODO

## Core Features

### Phase 1: Authentication & User Profile
- [x] Implement OAuth login flow with Manus
- [x] Create gender selection screen (first login)
- [x] Build user profile screen
- [x] Implement logout functionality
- [x] Store user data in database (users table)

### Phase 2: Calendar Upload & OCR
- [x] Create calendar upload screen (camera/gallery picker)
- [x] Integrate LLM-based OCR for calendar image processing
- [x] Parse OCR results into time blocks (occupied/free)
- [x] Build manual confirmation/editing screen
- [x] Store availability in database (availability table)
- [x] Handle multiple calendar uploads (weekly updates)

### Phase 3: Schedule Optimization Engine
- [x] Design database schema for schedule optimization
- [x] Implement algorithm to find optimal training times
- [x] Prioritize gender-based groupings (men/men, women/women)
- [x] Rank suggestions by number of available players
- [x] Create tRPC endpoint for schedule suggestions
- [x] Handle edge cases (no availability, all busy, etc.)

### Phase 4: Visualization & Scheduling
- [x] Build home screen with suggested trainings
- [x] Create weekly calendar view
- [ ] Implement training details screen
- [x] Build training suggestions list (ranked)
- [x] Add attendance confirmation/cancellation
- [ ] Display confirmed players per training

### Phase 5: Team Management (Captain Role)
- [ ] Implement captain role detection
- [ ] Build training approval/rejection screen
- [ ] Create team management dashboard
- [ ] Add training modification capability
- [ ] Implement notifications for team members

### Phase 6: UI/UX Polish
- [ ] Apply consistent branding (colors, fonts, spacing)
- [ ] Implement smooth transitions and animations
- [ ] Add loading states and error handling
- [ ] Optimize for mobile (responsive, one-handed use)
- [ ] Test accessibility (VoiceOver, contrast ratios)
- [ ] Add haptic feedback for key interactions

### Phase 7: Testing & Deployment
- [ ] Write unit tests for schedule optimization logic
- [ ] Test OCR accuracy with various calendar formats
- [ ] Perform end-to-end testing of main flows
- [ ] Test on iOS simulator and real device
- [ ] Generate app icon and branding assets
- [ ] Create checkpoint for production build

## Database Schema
- [x] Create users table (extended with gender, role)
- [x] Create availability table (time blocks per user)
- [x] Create teams table (team information)
- [x] Create team_members table (user-team relationships)
- [x] Create training_sessions table (suggested/approved trainings)
- [x] Create training_confirmations table (user attendance)
- [x] Create calendar_uploads table (track OCR history)

## Backend API (tRPC)
- [x] Auth endpoints (login, logout, current user)
- [x] User profile endpoints (get, update gender/role)
- [x] Availability endpoints (upload, get, update)
- [x] Schedule optimization endpoint (get suggestions)
- [x] Training session endpoints (create, approve, reject)
- [x] Attendance endpoints (confirm, cancel)
- [ ] Team management endpoints (list members, update roles)
- [x] OCR processing endpoint (process calendar image)

## Known Issues & Improvements
- [ ] Add push notifications for training confirmations
- [ ] Implement mixed-gender training option
- [ ] Add calendar sync with university calendar API (if available)
- [ ] Create admin dashboard for monitoring
- [ ] Add analytics for training attendance rates
- [ ] Implement recurring training templates

## Completed Items
(None yet - tracking starts from first implementation)


## Phase 8: Conversión a PWA (Progressive Web App)

### Web Optimization
- [ ] Optimizar responsive design para navegadores móviles
- [ ] Mejorar viewport y escalado
- [ ] Ajustar tamaños de botones para touch
- [ ] Optimizar imágenes para web

### PWA Implementation
- [ ] Crear manifest.json para instalación
- [ ] Implementar Service Worker
- [ ] Agregar soporte offline
- [ ] Crear splash screen para PWA
- [ ] Agregar iconos para diferentes tamaños

### Performance
- [ ] Optimizar bundle size
- [ ] Implementar lazy loading
- [ ] Mejorar Core Web Vitals
- [ ] Cachear assets estáticos

### Deployment
- [ ] Configurar HTTPS
- [ ] Crear guía de instalación
- [ ] Documentar acceso por navegador
- [ ] Probar en iOS Safari y Chrome Android


## Phase 9: Estadísticas de Asistencia

### Backend
- [ ] Crear tabla de estadísticas agregadas
- [ ] Implementar rutas tRPC para obtener estadísticas
- [ ] Calcular tasa de asistencia por jugador
- [ ] Generar gráficos de tendencias

### Frontend
- [ ] Crear pantalla de estadísticas
- [ ] Implementar gráficos con Chart.js
- [ ] Mostrar ranking de asistencia
- [ ] Agregar tab de estadísticas en navegación
- [ ] Mostrar métricas por período (semana, mes, año)
