# SpotApp - Documentación Completa del Proyecto

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [¿Qué es SpotApp?](#qué-es-spotapp)
3. [Cómo Funciona](#cómo-funciona)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Características Principales](#características-principales)
6. [Arquitectura del Sistema](#arquitectura-del-sistema)
7. [Estructura del Proyecto](#estructura-del-proyecto)
8. [Flujos de Usuario](#flujos-de-usuario)
9. [Base de Datos](#base-de-datos)
10. [Deployment](#deployment)

---

## Introducción

**SpotApp** es una plataforma social de descubrimiento de ubicaciones y lugares de interés. Combina elementos de redes sociales con un sistema de recomendación y reseñas para ayudar a los usuarios a explorar, compartir y calificar lugares en su comunidad.

---

## ¿Qué es SpotApp?

### Propósito Principal
SpotApp es una aplicación web que permite a los usuarios:

- **Descubrir nuevos lugares** en su área (restaurantes, parques, eventos, etc.)
- **Compartir ubicaciones** que consideren interesantes
- **Dejar reseñas y calificaciones** con comentarios detallados
- **Conectarse con amigos** y ver qué lugares visitan
- **Guardar favoritos** para acceso rápido
- **Buscar lugares** por nombre, ubicación o categoría

### Valor Propuesto
- 🎯 Acceso a recomendaciones de la comunidad local
- 🌍 Descubrimiento geográfico basado en mapas interactivos
- ⭐ Sistema de calificación transparente y verificable
- 👥 Conexión social con otros exploradores locales
- 💾 Guardado de lugares favoritos y acceso instantáneo

---

## Cómo Funciona

### Flujo General de Usuario

```
┌─────────────────────────────────────────────────────────────┐
│                    INICIO DE SESIÓN                         │
│  Email/Contraseña o Google OAuth                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    FEED PRINCIPAL (LOBBY)                   │
│  - Mapa interactivo con lugares                             │
│  - Tarjetas de lugares con información                      │
│  - Barra de búsqueda en tiempo real                         │
│  - Filtros por tendencias y favoritos                       │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴────────────┬─────────────────┐
         │                        │                 │
         ▼                        ▼                 ▼
    EXPLORAR LUGAR         AGREGAR LUGAR      VER AMIGOS
    - Ver detalles         - Compartir nuevo  - Conectar
    - Ver reseñas          - Añadir fotos     - Seguir
    - Ver ubicación         - Describir       - Chat
    - Calificar            - Ubicación GPS
         │                        │                 │
         └───────────┬────────────┴─────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  PERSISTIR EN BD      │
         │  - Lugares           │
         │  - Reseñas           │
         │  - Conexiones        │
         │  - Búsquedas         │
         └───────────────────────┘
```

### Proceso Detallado

#### 1. **Autenticación**
```
Usuario abre SpotApp
    ↓
¿Está autenticado?
    ├─ NO → Mostrar Login/Registro
    │       └─ Email + Contraseña O Google OAuth
    │           └─ Verificar credenciales en Firebase
    │               └─ Crear perfil en Prisma
    │                   └─ Redirigir a Lobby
    └─ SÍ → Ir a Lobby
```

#### 2. **Descubrimiento de Lugares**
```
Usuario accede a Lobby (Feed Principal)
    ↓
Backend carga:
    - Lugares cercanos (geolocalización)
    - Lugares siguientes (amigos)
    - Lugares populares (tendencias)
    ↓
Frontend renderiza:
    - Mapa interactivo con marcadores
    - Tarjetas de lugares con:
        • Foto principal
        • Nombre y descripción
        • Rating promedio
        • Número de reseñas
        • Ubicación
```

#### 3. **Agregar Nuevo Lugar**
```
Usuario hace clic en "Publicar lugar"
    ↓
Modal de creación:
    - Campo de nombre (validación real-time)
    - Descripción (área de texto)
    - Foto (upload con validación NSFW)
    - Ubicación (GPS o mapa)
    ↓
Validaciones:
    - Nombre no vacío
    - Imagen cargada
    - Ubicación válida
    - Imagen segura (nsfwjs)
    ↓
Confirmación de datos:
    - Si usuario cancela → Mostrar diálogo "¿Descartar cambios?"
    ↓
Envío a Backend (NestJS/Prisma)
    ↓
Lugar guardado en BD
    ↓
Actualizar feed en tiempo real
```

#### 4. **Reseñas y Calificaciones**
```
Usuario abre un lugar
    ↓
Ve sección "Comentarios y reseñas":
    - Lista de reseñas existentes
    - Campo para escribir nueva reseña
    - Selector de estrellas (Rating 1-5)
    ↓
Usuario escribe comentario + selecciona estrellas
    ↓
Backend calcula:
    - Rating promedio del lugar
    - Total de reseñas
    ↓
Reseña guardada
    ↓
Actualizar tarjeta de lugar con nuevo rating
```

#### 5. **Conexiones Sociales**
```
Usuario ve perfil de otro usuario
    ↓
Opciones:
    - Agregar amigo → Seguimiento bidireccional
    - Ver lugares compartidos
    - Ver reseñas del usuario
    ↓
En tab "Amigos":
    - Lista de amigos
    - Últimos lugares que visitaron
    - Ver perfil completo
```

---

## Stack Tecnológico

### Frontend
```
┌─────────────────────────────────────┐
│         SPOTAPP-FRONTEND            │
├─────────────────────────────────────┤
│ Framework: React 18 + Vite          │
│ Lenguaje: JavaScript/JSX            │
│ Styling: Tailwind CSS               │
│ Formularios: React Hook Form        │
│ Maps: Leaflet                       │
│ Icons: react-icons (Fi, Md)         │
│ Auth: Firebase SDK                  │
│ HTTP: Fetch API                     │
│ Estado: React Context + Hooks       │
│ Contenido: NSFWJS (detección NSFW)  │
└─────────────────────────────────────┘
```

### Backend
```
┌─────────────────────────────────────┐
│       SPOTAPP-BACKEND (NestJS)      │
├─────────────────────────────────────┤
│ Framework: NestJS                   │
│ Lenguaje: TypeScript                │
│ ORM: Prisma                         │
│ Base de Datos: PostgreSQL           │
│ Autenticación: Firebase             │
│ Cloud Storage: AWS S3               │
│ Deployment: Render                  │
│ API: REST + GraphQL (ready)         │
└─────────────────────────────────────┘
```

### Infraestructura
```
┌──────────────────────────────────────────┐
│         HOSTING & DEPLOYMENT             │
├──────────────────────────────────────────┤
│ Frontend: Vercel (Jamstack + COOP)      │
│ Backend API: Render (Node.js)           │
│ Base de Datos: PostgreSQL (Render)      │
│ Almacenamiento: AWS S3                  │
│ Autenticación: Firebase Auth             │
│ Dominio: Custom domain (configurado)    │
└──────────────────────────────────────────┘
```

---

## Características Principales

### 1. **Autenticación y Perfiles** 🔐
- Login con email/contraseña
- Autenticación Google OAuth
- Registro con validación en tiempo real
- Contraseñas con requisitos de seguridad
- Perfiles de usuario públicos

### 2. **Descubrimiento de Lugares** 🗺️
- Mapa interactivo de Leaflet
- Búsqueda en tiempo real
- Filtros por tendencias y favoritos
- Geolocalización automática
- Tarjetas informativas con rating

### 3. **Sistema de Reseñas** ⭐
- Calificación de 1-5 estrellas
- Comentarios detallados
- Rating promedio por lugar
- Historial de reseñas del usuario
- Validación de datos

### 4. **Gestión de Contenido** 📸
- Upload de fotos con validación NSFW
- Almacenamiento en AWS S3
- Optimización de imágenes
- Eliminación de contenido explícito

### 5. **Conexiones Sociales** 👥
- Sistema de amistad bidireccional
- Chat entre amigos
- Ver actividad de amigos
- Sugerencias de amigos

### 6. **Historial y Favoritos** 📌
- Guardar lugares favoritos
- Historial de búsquedas
- Historial de calificaciones
- Acceso rápido a lugares guardados

### 7. **Centro de Ayuda** ❓
- FAQ completo con 40+ preguntas
- Búsqueda en tiempo real
- 5 categorías de temas
- Categorías: Primeros pasos, Explorando, Reseñas, Cuenta, Solucionar problemas

---

## Arquitectura del Sistema

### Diagrama de Capas

```
┌──────────────────────────────────────────────────┐
│                   FRONTEND (React)               │
│  ┌────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ Componentes│  │   Contexto  │  │   Utils  │ │
│  │  (JSX)     │  │  (State)    │  │ (Helpers)│ │
│  └────────────┘  └─────────────┘  └──────────┘ │
└───────────────────────┬──────────────────────────┘
                        │
              REST API / HTTP Requests
                        │
┌───────────────────────▼──────────────────────────┐
│                  BACKEND (NestJS)                │
│  ┌───────────────────────────────────────────┐  │
│  │          CONTROLLERS (Routes)             │  │
│  ├───────────────────────────────────────────┤  │
│  │ /users  /places  /reviews  /friends      │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │         SERVICES (Business Logic)        │  │
│  ├───────────────────────────────────────────┤  │
│  │ UserService, PlaceService, ReviewService│  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │      PRISMA ORM (Data Access Layer)      │  │
│  └───────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────┘
                        │
           Database Queries / SQL
                        │
┌───────────────────────▼──────────────────────────┐
│           PostgreSQL Database                    │
│  ┌──────────┐  ┌────────┐  ┌─────────┐         │
│  │ Usuarios │  │Lugares │  │ Reseñas │         │
│  ├──────────┤  ├────────┤  ├─────────┤         │
│  │ Amigos   │  │ Fotos  │  │Comments │         │
│  └──────────┘  └────────┘  └─────────┘         │
└──────────────────────────────────────────────────┘
```

### Flujo de Datos

```
Usuario Interacción
    ↓
React Component
    ↓
State Update (Context/Hooks)
    ↓
Fetch API Call → Backend
    ↓
NestJS Controller (Route)
    ↓
Service (Business Logic)
    ↓
Prisma Query Builder
    ↓
PostgreSQL Query
    ↓
Data Response (JSON)
    ↓
Frontend Updates UI
    ↓
Usuario ve cambios
```

---

## Estructura del Proyecto

### Directorio Frontend (`spotapp-frontend/`)

```
spotapp-frontend/
├── src/
│   ├── componentes/          # Componentes reutilizables
│   │   ├── acordeon-inicio/   # Login/Registro
│   │   ├── barra-busqueda/    # Búsqueda
│   │   ├── barra_lateral/     # Navegación
│   │   ├── barra_mensajes/    # Chat
│   │   ├── buzon_resenas/     # Reseñas
│   │   ├── foto-perfil/       # Avatar
│   │   ├── help-tooltip/      # Tooltips
│   │   ├── tarjetas_ubicacion/ # Cards de lugares
│   │   └── ... otros componentes
│   ├── pantallas/             # Páginas principales
│   │   ├── lobby/             # Feed principal
│   │   ├── ayuda/             # Centro de ayuda
│   │   ├── sobre-nosotros/    # About
│   │   └── error/             # 404/Error
│   ├── config/                # Configuraciones
│   │   └── firebase.jsx       # Firebase setup
│   ├── contexts/              # React Context
│   │   └── userProvider.jsx   # Auth context
│   ├── utils/                 # Utilidades
│   │   ├── uploadImage.js     # Upload a S3
│   │   └── ... helpers
│   ├── App.jsx                # Rutas principales
│   ├── main.jsx               # Punto de entrada
│   └── index.css              # Estilos globales
├── package.json
├── vite.config.js
├── tailwind.config.js
└── vercel.json

```

### Directorio Backend (`backend/`)

```
backend/
├── src/
│   ├── main.ts                # Punto de entrada
│   ├── app.module.ts          # Módulo raíz
│   ├── app.controller.ts      # Rutas principales
│   ├── app.service.ts         # Servicios
│   ├── user/                  # Módulo Usuarios
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── places/                # Módulo Lugares
│   │   ├── places.controller.ts
│   │   ├── places.service.ts
│   │   └── places.module.ts
│   ├── resena/                # Módulo Reseñas
│   │   ├── resena.controller.ts
│   │   ├── resena.service.ts
│   │   └── resena.module.ts
│   ├── comentario/            # Módulo Comentarios
│   ├── amistad/               # Módulo Amistades
│   ├── chat/                  # Módulo Chat
│   ├── AWS/                   # Integración S3
│   └── ... otros módulos
├── prisma/
│   ├── schema.prisma          # Esquema base de datos
│   └── migrations/            # Historial de cambios
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Flujos de Usuario

### Flujo 1: Nuevo Usuario - Registro y Primer Exploración

```
1. Usuario abre SpotApp
   ↓
2. Hace clic en "Crear cuenta"
   ↓
3. Ingresa:
   - Nombre completo (validado en tiempo real)
   - Email (verificado contra formato)
   - Contraseña (requisitos: mayús, minús, números, símbolos)
   - Acepta términos
   ↓
4. Opción: Google OAuth alternative
   ↓
5. Backend valida y crea perfil
   ↓
6. Redirige a Lobby
   ↓
7. Usuario ve:
   - Mapa con lugares cercanos
   - Tarjetas de lugares populares
   - Botón "Agregar lugar"
   - Barra lateral con navegación
```

### Flujo 2: Descubrir y Calificar un Lugar

```
1. Usuario en Lobby busca un lugar
   - Usa barra de búsqueda
   - O hace clic en tarjeta
   ↓
2. Modal/Página muestra:
   - Foto principal
   - Descripción
   - Ubicación en mapa
   - Rating promedio
   - Lista de reseñas
   ↓
3. Usuario escribe reseña:
   - Texto en campo de comentarios
   - Selecciona estrellas (1-5)
   ↓
4. Haz clic "Publicar reseña"
   ↓
5. Validación:
   - Comentario no vacío
   - Rating seleccionado
   - Usuario autenticado
   ↓
6. Backend:
   - Guarda reseña
   - Recalcula rating promedio
   - Retorna datos actualizados
   ↓
7. Frontend actualiza:
   - Muestra nueva reseña
   - Actualiza rating promedio
   - Limpia formulario
```

### Flujo 3: Compartir Nuevo Lugar

```
1. Usuario hace clic "Publicar lugar"
   ↓
2. Se abre modal con formulario:
   - Nombre del lugar
   - Descripción
   - Foto
   - Ubicación (GPS o mapa)
   ↓
3. Usuario completa datos:
   - Validación en tiempo real
   - Preview de foto
   ↓
4. Usuario hace clic "Publicar lugar"
   ↓
5. Antes de enviar, se valida:
   - Todos los campos completos
   - Imagen cargada
   - Ubicación válida
   - Imagen sin contenido NSFW (nsfwjs)
   ↓
6. Si usuario presiona X/Cancelar:
   - Si hay datos → Mostrar "¿Descartar cambios?"
   - Si acepta → Cerrar modal
   - Si cancela → Continuar editando
   ↓
7. Backend procesa:
   - Carga imagen a AWS S3
   - Crea lugar en BD
   - Vincula a usuario
   ↓
8. Frontend:
   - Muestra confirmación
   - Actualiza feed
   - Cierra modal
```

### Flujo 4: Conexiones Sociales

```
1. Usuario A ve perfil de Usuario B
   ↓
2. Hace clic "Agregar amigo"
   ↓
3. Backend:
   - Crea relación bidireccional
   - Notifica a Usuario B
   ↓
4. En tab "Amigos":
   - Ve lista de amigos
   - Lugares que compartieron
   - Últimas reseñas
   ↓
5. Puede iniciar chat:
   - Haz clic en amigo
   - Escribe mensaje
   ↓
6. Mensaje guardado y entregado
   - Notificación a amigo
```

---

## Base de Datos

### Esquema Principal (Prisma)

```prisma
model Usuario {
  id              String      @id @default(cuid())
  nombre          String
  email           String      @unique
  fotoPerfil      String?
  googleId        String?     @unique
  ubicacion       String?
  createdAt       DateTime    @default(now())
  
  // Relaciones
  lugares         Lugar[]
  resenas         ResenaUbicacion[]
  comentarios     ComentariosResena[]
  amistad         Amistad[]
  amigos          Amistad[]   @relation("amigo")
  favoritos       Favorito[]
  mensajes        Mensaje[]
  vistas          PlaceView[]
}

model Lugar {
  id              String      @id @default(cuid())
  nombre          String
  descripcion     String
  foto            String
  latitud         Float
  longitud        Float
  direccion       String?
  creadoEn        DateTime    @default(now())
  usuarioId       String
  
  // Relaciones
  usuario         Usuario     @relation(fields: [usuarioId], references: [id])
  resenas         ResenaUbicacion[]
  comentarios     ComentariosResena[]
  favoritos       Favorito[]
  vistas          PlaceView[]
}

model ResenaUbicacion {
  id              String      @id @default(cuid())
  calificacion    Int         // 1-5 stars
  comentario      String?
  usuarioId       String
  ubicacionId     String
  createdAt       DateTime    @default(now())
  
  // Relaciones
  usuario         Usuario     @relation(fields: [usuarioId], references: [id])
  ubicacion       Lugar       @relation(fields: [ubicacionId], references: [id])
  comentarios     ComentariosResena[]
}

model Amistad {
  id              String      @id @default(cuid())
  usuarioId       String
  amigoId         String
  createdAt       DateTime    @default(now())
  
  // Relaciones
  usuario         Usuario     @relation(fields: [usuarioId], references: [id])
  amigo           Usuario     @relation("amigo", fields: [amigoId], references: [id])
}

model Favorito {
  id              String      @id @default(cuid())
  usuarioId       String
  ubicacionId     String
  createdAt       DateTime    @default(now())
  
  usuario         Usuario     @relation(fields: [usuarioId], references: [id])
  ubicacion       Lugar       @relation(fields: [ubicacionId], references: [id])
}

model PlaceView {
  id              String      @id @default(cuid())
  usuarioId       String
  ubicacionId     String
  viewedAt        DateTime    @default(now())
  
  usuario         Usuario     @relation(fields: [usuarioId], references: [id])
  ubicacion       Lugar       @relation(fields: [ubicacionId], references: [id])
}

model Mensaje {
  id              String      @id @default(cuid())
  usuarioId       String
  conversacion    String      // ID de la conversación
  contenido       String
  createdAt       DateTime    @default(now())
  
  usuario         Usuario     @relation(fields: [usuarioId], references: [id])
}
```

### Relaciones Principales

```
Usuario ← → Usuario (Amistad)
   │
   ├── Lugar (creador)
   │    ├── ResenaUbicacion
   │    │    └── ComentariosResena
   │    ├── Favorito
   │    └── PlaceView
   └── Mensaje
```

---

## Deployment

### Frontend (Vercel)

**Configuración:**
- Hosting automático desde GitHub
- Build: `npm run build` con Vite
- Preview automático de PRs
- COOP headers para protección de contexto
- Redeployment en cada push a main

**Variables de Entorno:**
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_BACKEND_URL=https://spotapp-api.render.com
VITE_AWS_REGION=us-east-1
```

### Backend (Render)

**Configuración:**
- Hosting Node.js
- Auto-deploy desde GitHub
- PostgreSQL integrado
- SSL certificado automático
- Health checks habilitados

**Variables de Entorno:**
```
DATABASE_URL=postgresql://...
FIREBASE_PROJECT_ID=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=spotapp-images
NODE_ENV=production
```

### Base de Datos (PostgreSQL)

**Render Cloud:**
- PostgreSQL 15
- Backups automáticos
- Replicación habilitada
- Conexión SSL
- Tamaño: Escalable

**Migraciones:**
```bash
# Desarrollo
npm run prisma:migrate:dev

# Producción (automático en Render)
npm run prisma:migrate:deploy
```

---

## Validaciones y Seguridad

### Validaciones en Frontend
- ✅ Email format validación
- ✅ Contraseña con requisitos
- ✅ Campos no vacíos
- ✅ Longitud mínima/máxima
- ✅ Confirmación de cambios críticos

### Validaciones en Backend
- ✅ Verificación de autenticación
- ✅ Autorización de recursos
- ✅ Sanitización de inputs
- ✅ Rate limiting
- ✅ CORS habilitado

### Detección de Contenido
- NSFWJS: Detecta imágenes explícitas
- Validación de tipo MIME
- Límite de tamaño de archivo
- Almacenamiento seguro en S3

---

## Próximos Pasos y Mejoras Futuras

### Corto Plazo
- [ ] Testing automatizado (Jest, E2E)
- [ ] Optimización de bundle
- [ ] PWA (Progressive Web App)
- [ ] Offline mode
- [ ] Analytics dashboard

### Mediano Plazo
- [ ] Mobile app (React Native)
- [ ] Sistema de notificaciones push
- [ ] GraphQL API
- [ ] Sistema de recomendación ML
- [ ] Eventos/meetups

### Largo Plazo
- [ ] Integración con Google Maps API
- [ ] Sistema de monetización
- [ ] Marketplace local
- [ ] Programas de embajadores
- [ ] Expansión internacional

---

## Contacto y Soporte

Para más información o soporte:
- Email: support@spotapp.com
- GitHub: [Link al repositorio]
- Documentación API: [Link a docs]

---

**Última actualización:** Mayo 13, 2026
**Versión:** 2.0.0 (Con Sistema de Ayuda)
**Estado:** Production Ready ✅
