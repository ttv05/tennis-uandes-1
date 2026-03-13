# Diseño de Interfaz Móvil - Tenis Uandes

## Resumen Ejecutivo

La aplicación **Tenis Uandes** es una herramienta de coordinación de entrenamientos para equipos universitarios de tenis. Está diseñada para **iOS** siguiendo las **Apple Human Interface Guidelines (HIG)**, con enfoque en **usabilidad universitaria**, **eficiencia de tiempo** y **coordinación grupal**.

El diseño prioriza:
- **Navegación intuitiva** con tab bar en la parte inferior
- **Interfaz limpia y minimalista** que respeta el espacio visual
- **Acciones de un toque** para tareas frecuentes
- **Feedback visual claro** (confirmaciones, estados de carga)
- **Tipografía legible** y jerarquía clara

---

## Lista de Pantallas

La aplicación consta de las siguientes pantallas principales:

| Pantalla | Propósito | Flujo |
|----------|-----------|-------|
| **Login** | Autenticación inicial | Entrada → Selección de género → Home |
| **Home** | Resumen de entrenamientos próximos | Tab principal, muestra 3-5 entrenamientos sugeridos |
| **Calendario** | Visualización semanal de disponibilidad | Calendario semanal con bloques de tiempo |
| **Subir Horario** | Carga de foto de calendario universitario | Captura/selección de foto → OCR → Confirmación manual |
| **Disponibilidad** | Gestión manual de ventanas de tiempo libre | Lista de bloques de tiempo, edición inline |
| **Entrenamientos Sugeridos** | Ranking de mejores horarios | Lista ordenada por cantidad de jugadores disponibles |
| **Detalles de Entrenamiento** | Información completa de una sesión | Horario, jugadores confirmados, opción de confirmar asistencia |
| **Mi Perfil** | Información del usuario y configuración | Género, nombre, rol (jugador/capitán), logout |
| **Gestión de Equipo** (Capitán) | Aprobación y modificación de entrenamientos | Tabla de entrenamientos pendientes de aprobación |

---

## Funcionalidad Principal y Contenido

### 1. Pantalla de Login

**Contenido:**
- Logo de Tenis Uandes (icono de raqueta + texto)
- Botón "Iniciar Sesión con Manus"
- Texto descriptivo: "Coordina entrenamientos con tu equipo"

**Flujo:**
1. Usuario toca "Iniciar Sesión"
2. Se abre navegador del sistema → OAuth Manus
3. Usuario se autentica
4. Redirección a pantalla de selección de género

### 2. Pantalla de Selección de Género (Primera Vez)

**Contenido:**
- Título: "¿Cuál es tu género?"
- Dos botones grandes: "Hombre" / "Mujer"
- Texto pequeño: "Esto ayuda a optimizar entrenamientos hombre-hombre y mujer-mujer"

**Lógica:**
- Se guarda en la base de datos
- Nunca vuelve a aparecer (a menos que el usuario lo edite en perfil)

### 3. Pantalla Home

**Contenido:**
- **Encabezado:** "Próximos Entrenamientos" + fecha actual
- **Tarjetas de entrenamientos sugeridos (máx 3):**
  - Horario (ej: "Lunes 14:00 - 15:30")
  - Cantidad de jugadores disponibles (ej: "8 jugadores")
  - Género (ej: "Hombres")
  - Botón "Confirmar Asistencia" (si no confirmado)
  - Botón "Cancelar" (si ya confirmado)
- **Botón flotante:** "Subir Horario" (naranja/primario)
- **Sección inferior:** "Tu disponibilidad esta semana" con mini-calendario

**Funcionalidad:**
- Muestra entrenamientos ordenados por cantidad de jugadores disponibles
- Permite confirmar/cancelar asistencia en un toque
- Acceso rápido a subir horario

### 4. Pantalla de Subir Horario

**Contenido:**
- Título: "Sube tu horario de clases"
- Instrucciones: "Toma una foto de tu calendario universitario"
- Dos opciones:
  - Botón "Tomar Foto" (cámara)
  - Botón "Seleccionar de Galería" (librería)
- Área de preview de la foto seleccionada
- Botón "Procesar con OCR" (después de seleccionar foto)

**Flujo OCR:**
1. Usuario selecciona foto
2. Se muestra preview
3. Toca "Procesar"
4. Pantalla de carga: "Analizando tu calendario..."
5. Resultados: Lista de bloques detectados (clases ocupadas y ventanas libres)
6. Usuario puede editar/confirmar manualmente
7. Guardar disponibilidad

### 5. Pantalla de Disponibilidad

**Contenido:**
- Título: "Tu Disponibilidad"
- Selector de semana (izquierda/derecha para navegar)
- **Tabla de bloques de tiempo:**
  - Lunes - Viernes, 08:00 - 20:00
  - Bloques ocupados (gris, no editable)
  - Bloques libres (verde, tappable para editar)
  - Botón "+" para agregar manualmente

**Funcionalidad:**
- Edición inline: tocar bloque libre → toggle disponibilidad
- Agregar bloques manuales: "Lunes 14:00-16:00"
- Guardar automáticamente

### 6. Pantalla de Calendario Semanal

**Contenido:**
- Encabezado: Semana actual (ej: "13 - 19 de Marzo")
- **Calendario en grid (7 columnas, 1 fila por día):**
  - Cada día muestra: nombre día, fecha, cantidad de jugadores disponibles
  - Código de colores:
    - Verde: muchos jugadores disponibles (8+)
    - Amarillo: algunos jugadores (4-7)
    - Rojo: pocos jugadores (<4)
- Botones navegación: "< Anterior" | "Siguiente >"

**Funcionalidad:**
- Tocar un día → ver entrenamientos sugeridos para ese día
- Visualización rápida de disponibilidad grupal

### 7. Pantalla de Entrenamientos Sugeridos

**Contenido:**
- Título: "Entrenamientos Recomendados"
- **Filtros:** "Todos" | "Hombres" | "Mujeres" (tabs)
- **Lista de entrenamientos:**
  - Ranking por cantidad de jugadores
  - Cada item muestra:
    - Horario (ej: "Lunes 14:00 - 15:30")
    - Cantidad de jugadores: "8 de 12 disponibles"
    - Género: "Hombres"
    - Botón "Ver Detalles"

**Funcionalidad:**
- Ordenamiento automático por cantidad de jugadores
- Filtrado por género
- Acceso a detalles de cada entrenamiento

### 8. Pantalla de Detalles de Entrenamiento

**Contenido:**
- **Encabezado:** Horario grande (ej: "Lunes 14:00 - 15:30")
- **Información:**
  - Género: "Hombres"
  - Duración sugerida: "90 minutos"
  - Cantidad de jugadores: "8 confirmados, 12 disponibles"
- **Lista de jugadores confirmados:**
  - Nombre, género, estado (confirmado/pendiente)
- **Botones de acción:**
  - "Confirmar Asistencia" (si no confirmado)
  - "Cancelar Asistencia" (si confirmado)
  - "Compartir" (enviar a otros jugadores)

**Funcionalidad:**
- Muestra quiénes ya confirmaron
- Permite confirmar/cancelar en un toque
- Opción de compartir con otros jugadores

### 9. Pantalla de Mi Perfil

**Contenido:**
- **Avatar/Iniciales** del usuario
- **Información:**
  - Nombre
  - Email
  - Género: "Hombre" / "Mujer" (editable)
  - Rol: "Jugador" / "Capitán"
- **Botones:**
  - "Editar Perfil"
  - "Cambiar Género"
  - "Cerrar Sesión"

**Funcionalidad:**
- Edición de género
- Logout
- Visualización de rol

### 10. Pantalla de Gestión de Equipo (Capitán)

**Contenido:**
- Título: "Gestión de Entrenamientos"
- **Tabla de entrenamientos:**
  - Estado (Pendiente / Aprobado / Cancelado)
  - Horario
  - Cantidad de jugadores
  - Botones: "Aprobar" | "Rechazar" | "Editar"

**Funcionalidad:**
- Capitán aprueba/rechaza entrenamientos sugeridos
- Puede modificar horarios
- Envía notificaciones a jugadores

---

## Flujos de Usuario Principales

### Flujo 1: Primer Inicio de Sesión

```
Login → Selección de Género → Home (con banner: "Sube tu horario")
```

### Flujo 2: Subir Horario y Generar Entrenamientos

```
Home → Botón "Subir Horario" → Cámara/Galería → OCR → Confirmación → Guardar
→ Backend optimiza horarios → Home muestra sugerencias
```

### Flujo 3: Confirmar Asistencia a Entrenamiento

```
Home → Tarjeta de entrenamiento → Botón "Confirmar" → Confirmación
→ Notificación a otros jugadores (si llega a cantidad mínima)
```

### Flujo 4: Gestión de Equipo (Capitán)

```
Perfil → "Gestión de Equipo" → Lista de entrenamientos → Aprobar/Rechazar
→ Notificaciones enviadas a jugadores
```

---

## Principios de Diseño (Apple HIG)

### 1. Claridad

- **Jerarquía visual clara:** Títulos grandes, subtítulos medianos, detalles pequeños
- **Espaciado generoso:** Mínimo 16pt entre elementos
- **Tipografía consistente:** SF Pro Display (iOS nativa)

### 2. Deference

- **Contenido primero:** Interfaz se adapta al contenido, no al revés
- **Fondo blanco/claro:** Maximiza legibilidad
- **Colores limitados:** Máximo 3 colores primarios

### 3. Interactividad

- **Feedback inmediato:** Cada toque genera respuesta visual
- **Animaciones sutiles:** Transiciones de 200-300ms
- **Haptics:** Vibración ligera en confirmaciones

---

## Paleta de Colores

| Uso | Color | Hex |
|-----|-------|-----|
| Primario (Botones, Acentos) | Naranja Tenis | #FF8C00 |
| Secundario (Información) | Azul Cielo | #0A7EA4 |
| Éxito (Confirmado) | Verde | #22C55E |
| Advertencia (Pendiente) | Amarillo | #F59E0B |
| Error (Cancelado) | Rojo | #EF4444 |
| Fondo | Blanco | #FFFFFF |
| Texto Primario | Gris Oscuro | #11181C |
| Texto Secundario | Gris Medio | #687076 |
| Borde | Gris Claro | #E5E7EB |

---

## Consideraciones de Usabilidad

### Orientación
- **Portrait (9:16)** solamente
- Diseño optimizado para una mano (elementos en zona accesible)

### Accesibilidad
- **Contraste:** Mínimo 4.5:1 para texto
- **Tamaño de toque:** Mínimo 44×44pt
- **VoiceOver:** Todos los elementos etiquetados

### Performance
- **Carga rápida:** Máximo 2 segundos para pantallas principales
- **Lazy loading:** Imágenes y listas grandes cargadas bajo demanda
- **Offline:** Disponibilidad local guardada en AsyncStorage

---

## Próximos Pasos

1. Implementar autenticación y selección de género
2. Crear pantalla de subida de horario con OCR
3. Implementar lógica de optimización de horarios
4. Diseñar e implementar visualización de entrenamientos
5. Agregar gestión de equipo para capitanes
6. Pulir animaciones y transiciones
