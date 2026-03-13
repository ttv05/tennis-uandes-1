# Guía de Publicación Gratuita - Tenis Uandes

## 📱 Opciones de Publicación Gratuita

Existen varias formas de publicar tu aplicación **Tenis Uandes** sin costo. A continuación, te presento las opciones ordenadas por facilidad y tiempo de implementación.

---

## Opción 1: Publicar como PWA (Recomendado - Más Fácil)

Una **Progressive Web App (PWA)** es una aplicación web que funciona como una app nativa. Es la opción más rápida y no requiere pagar nada.

### Ventajas

✅ **Completamente gratis** - Sin costos de publicación  
✅ **Acceso inmediato** - Funciona en navegadores  
✅ **Instalable** - Se puede instalar en home screen  
✅ **Multiplataforma** - iOS, Android, Windows, Mac  
✅ **Fácil de actualizar** - Cambios se reflejan automáticamente  

### Desventajas

⚠️ **No aparece en App Store/Play Store** - Solo por URL directa  
⚠️ **Requiere hosting** - Necesitas un servidor web  
⚠️ **Menos descubrimiento** - No tiene tienda de apps  

### Paso a Paso: Publicar como PWA

#### Paso 1: Preparar el Proyecto

Tu proyecto ya está configurado como PWA. Verifica que tengas estos archivos:

```
public/
├── manifest.json          ✅ Ya existe
├── service-worker.js      ✅ Ya existe
└── assets/images/
    ├── icon.png           ✅ Ya existe
    ├── favicon.png        ✅ Ya existe
    └── splash-icon.png    ✅ Ya existe
```

#### Paso 2: Elegir un Hosting Gratuito

Aquí hay opciones **100% gratuitas** para alojar tu PWA:

| Plataforma | Características | Límites | Pasos |
|-----------|-----------------|---------|-------|
| **Vercel** | Muy fácil, optimizado para React | 100 GB/mes | 3 pasos |
| **Netlify** | Interfaz amigable, CI/CD incluido | 100 GB/mes | 3 pasos |
| **GitHub Pages** | Gratis, integrado con Git | 1 GB | 5 pasos |
| **Firebase Hosting** | Rápido, escalable | 10 GB/mes | 4 pasos |

**Recomendación:** Usa **Vercel** o **Netlify** - son los más fáciles.

#### Paso 3A: Publicar en Vercel (Más Fácil)

**Requisitos:**
- Cuenta de GitHub (gratis)
- Proyecto en GitHub

**Pasos:**

1. **Sube tu proyecto a GitHub**
   ```bash
   # En tu terminal, en la carpeta del proyecto
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/tenis-uandes.git
   git push -u origin main
   ```

2. **Ve a Vercel.com**
   - Abre https://vercel.com
   - Haz clic en "Sign Up"
   - Selecciona "Continue with GitHub"
   - Autoriza Vercel a acceder a tus repositorios

3. **Importa tu proyecto**
   - Haz clic en "New Project"
   - Selecciona tu repositorio `tenis-uandes`
   - Vercel detectará que es un proyecto Expo
   - Haz clic en "Deploy"

4. **Espera a que se compile**
   - Vercel compilará tu proyecto automáticamente
   - Recibirás un URL como: `https://tenis-uandes.vercel.app`

5. **Comparte el enlace**
   ```
   https://tenis-uandes.vercel.app
   ```

**¡Listo!** Tu app está publicada. Cualquiera puede acceder por el navegador.

#### Paso 3B: Publicar en Netlify (Alternativa)

**Requisitos:**
- Proyecto en GitHub

**Pasos:**

1. **Ve a Netlify.com**
   - Abre https://netlify.com
   - Haz clic en "Sign up"
   - Selecciona "GitHub"

2. **Conecta tu repositorio**
   - Autoriza Netlify a acceder a GitHub
   - Selecciona el repositorio `tenis-uandes`

3. **Configura el build**
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Haz clic en "Deploy site"

4. **Espera el despliegue**
   - Netlify compilará y publicará
   - Recibirás un URL como: `https://tenis-uandes.netlify.app`

#### Paso 4: Instalar como App en Home Screen

Una vez publicada, los usuarios pueden instalarla:

**En iOS (Safari):**
1. Abre el enlace en Safari
2. Toca el botón Compartir (↑)
3. Selecciona "Añadir a pantalla de inicio"
4. Elige un nombre y toca "Añadir"

**En Android (Chrome):**
1. Abre el enlace en Chrome
2. Toca el menú (⋮)
3. Selecciona "Instalar aplicación"
4. Confirma la instalación

---

## Opción 2: Publicar en Google Play (Android - $25 único)

Si quieres una app nativa en Android, Google Play es la opción más barata.

### Ventajas

✅ **Bajo costo** - Solo $25 único (no recurrente)  
✅ **Descubrimiento** - Aparece en Play Store  
✅ **Confianza** - Usuarios confían en Play Store  
✅ **Actualizaciones automáticas** - Google Play gestiona updates  

### Desventajas

⚠️ **Pago único de $25** - Para crear cuenta de desarrollador  
⚠️ **Revisión de Google** - Puede tardar 24-48 horas  
⚠️ **Solo Android** - No funciona en iOS  

### Paso a Paso: Publicar en Google Play

#### Paso 1: Crear Cuenta de Desarrollador

1. Ve a https://play.google.com/console
2. Haz clic en "Create account"
3. Completa tu perfil
4. Paga $25 (es un pago único)
5. Espera a que se active tu cuenta (puede tardar 24 horas)

#### Paso 2: Preparar el Build

```bash
# En tu terminal
cd /home/ubuntu/tenis-uandes

# Generar APK/AAB
eas build --platform android

# Esto descargará el archivo .aab (Android App Bundle)
```

#### Paso 3: Crear la Aplicación en Play Console

1. En Google Play Console, haz clic en "Create app"
2. Completa los detalles:
   - **Nombre:** Tenis Uandes
   - **Categoría:** Sports
   - **Contenido:** Selecciona las opciones apropiadas

#### Paso 4: Cargar el Build

1. Ve a "Release" → "Production"
2. Haz clic en "Create new release"
3. Sube el archivo `.aab` que generaste
4. Completa:
   - **Notas de la versión:** "Versión inicial"
   - **Privacidad:** Acepta los términos

#### Paso 5: Completar Información de la App

Completa las secciones:
- **Descripción breve:** "Coordinación de entrenamientos de tenis universitario"
- **Descripción completa:** Describe las características
- **Capturas de pantalla:** Sube 2-5 capturas
- **Icono:** Sube tu logo
- **Contacto:** Tu email

#### Paso 6: Enviar para Revisión

1. Revisa todo esté correcto
2. Haz clic en "Submit for review"
3. Google revisará en 24-48 horas
4. ¡Publicada! Aparecerá en Play Store

**URL de tu app:**
```
https://play.google.com/store/apps/details?id=space.manus.tenis.uandes
```

---

## Opción 3: Publicar en App Store (iOS - $99/año)

Para iOS, Apple requiere una membresía de desarrollador.

### Ventajas

✅ **Tienda oficial** - Máxima confianza  
✅ **Mejor descubrimiento** - Aparece en App Store  
✅ **Usuarios iOS** - Acceso a la base de usuarios de Apple  

### Desventajas

⚠️ **$99 anuales** - Membresía recurrente  
⚠️ **Revisión estricta** - Apple es más exigente  
⚠️ **Proceso lento** - Revisión puede tardar 1-2 semanas  

### Paso a Paso: Publicar en App Store

#### Paso 1: Crear Cuenta de Desarrollador Apple

1. Ve a https://developer.apple.com
2. Haz clic en "Account"
3. Crea una Apple ID (si no tienes)
4. Completa tu perfil
5. Paga $99/año

#### Paso 2: Generar Build para iOS

```bash
cd /home/ubuntu/tenis-uandes

# Generar IPA para iOS
eas build --platform ios

# Esto generará un archivo .ipa
```

#### Paso 3: Usar Transporter para Subir

1. Descarga "Transporter" desde Mac App Store
2. Abre Transporter
3. Selecciona tu archivo `.ipa`
4. Haz clic en "Deliver"
5. Ingresa tus credenciales de Apple

#### Paso 4: Completar Información en App Store Connect

1. Ve a https://appstoreconnect.apple.com
2. Crea una nueva app
3. Completa:
   - Nombre
   - Descripción
   - Categoría: Sports
   - Capturas de pantalla
   - Icono

#### Paso 5: Enviar para Revisión

1. Revisa todo esté correcto
2. Haz clic en "Submit for Review"
3. Apple revisará en 1-2 semanas
4. ¡Publicada en App Store!

---

## Comparativa de Opciones

| Opción | Costo | Tiempo | Dificultad | Alcance |
|--------|-------|--------|-----------|---------|
| **PWA (Vercel)** | Gratis | 15 min | Muy fácil | Web + instalable |
| **Google Play** | $25 | 1-2 días | Fácil | Android |
| **App Store** | $99/año | 1-2 semanas | Medio | iOS |
| **Ambas tiendas** | $124/año | 2-3 semanas | Medio | iOS + Android |

---

## Mi Recomendación

**Para empezar rápido (RECOMENDADO):**

1. **Publica como PWA en Vercel** (15 minutos, gratis)
   - Comparte el enlace con tu equipo
   - Todos pueden acceder inmediatamente
   - Pueden instalar en home screen

2. **Luego publica en Google Play** ($25, 1-2 días)
   - Usuarios Android pueden descargar desde Play Store
   - Mejor descubrimiento

3. **Finalmente, considera App Store** ($99/año, 1-2 semanas)
   - Cuando tengas usuarios iOS que lo soliciten

---

## Pasos Finales para Publicar en Vercel

### Resumen Rápido

```bash
# 1. Inicializa Git (si no lo hiciste)
cd /home/ubuntu/tenis-uandes
git init
git add .
git commit -m "Initial commit"
git branch -M main

# 2. Crea repositorio en GitHub
# Ve a https://github.com/new
# Nombre: tenis-uandes
# Descripción: Coordinación de entrenamientos de tenis universitario

# 3. Sube a GitHub
git remote add origin https://github.com/TU_USUARIO/tenis-uandes.git
git push -u origin main

# 4. Ve a Vercel.com
# - Sign up con GitHub
# - Importa el repositorio
# - Deploy automático
```

### Resultado

Después de completar estos pasos:

✅ Tu app estará en línea en `https://tenis-uandes.vercel.app`  
✅ Cualquiera puede acceder por navegador  
✅ Se puede instalar como app en home screen  
✅ Se actualiza automáticamente cuando hagas push a GitHub  
✅ Completamente gratis  

---

## Preguntas Frecuentes

**¿Puedo cambiar el dominio?**

Sí, en Vercel/Netlify puedes:
- Usar un dominio personalizado (si tienes uno)
- Cambiar el nombre del proyecto

**¿Cómo actualizo la app después de publicar?**

Solo haz cambios en tu código y haz `git push`:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel/Netlify se actualizarán automáticamente.

**¿Puedo usar la PWA sin publicar?**

Sí, durante desarrollo puedes compartir el enlace de desarrollo:
```
https://8081-igs8qq4lpx1e3c038w861-ef167ed0.us1.manus.computer
```

Pero solo funciona mientras el servidor esté corriendo.

**¿Qué pasa si tengo errores en la compilación?**

Vercel/Netlify te mostrarán los errores. Puedes:
1. Revisar los logs
2. Corregir el código
3. Hacer `git push` nuevamente
4. La compilación se reintentará automáticamente

**¿Puedo monetizar la app?**

Sí, puedes agregar:
- Publicidad (Google AdSense)
- Suscripciones
- Compras dentro de la app

Pero eso es un paso futuro.

---

## Próximos Pasos

1. **Ahora:** Elige una opción de publicación (recomiendo Vercel PWA)
2. **Hoy:** Sigue los pasos para publicar
3. **Mañana:** Comparte el enlace con tu equipo
4. **Esta semana:** Recopila feedback y mejora
5. **Próximas semanas:** Considera Google Play si es necesario

---

## Soporte

Si tienes problemas durante la publicación:

1. **Vercel:** https://vercel.com/docs
2. **Netlify:** https://docs.netlify.com
3. **Google Play:** https://support.google.com/googleplay
4. **App Store:** https://developer.apple.com/support

---

**¡Felicidades! Tu app está lista para publicar.** 🎉

**Última actualización:** Marzo 13, 2026
