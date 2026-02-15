# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




# SpotApp

**SpotApp** es una aplicación web que permite a los usuarios explorar ubicaciones categorizadas, como restaurantes, parques, lugares recreativos y más.

La aplicación se divide en dos partes:
- **Backend:** desarrollado con NestJS y Prisma
- **Frontend:** desarrollado con React, Vite y Chakra UI

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [npm](https://www.npmjs.com/) (incluido con Node.js)
- [Docker](https://www.docker.com/) (opcional, para levantar la base de datos)

---

## Instalación y Ejecución

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/spotapp.git
cd spotapp


# Ir al directorio del backend
cd backend

# Instalar dependencias necesarias
npm install @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/config @nestjs/typeorm @nestjs/swagger class-validator class-transformer prisma @prisma/client aws-sdk dotenv

# (Opcional) Iniciar la base de datos con Docker
docker-compose up -d

# Ejecutar las migraciones de Prisma
npx prisma migrate dev

# Iniciar el servidor de desarrollo
npm run start:dev

El backend estará disponible en: http://localhost:8080



#FRONTEND 
# Ir al directorio del frontend
cd ../spotapp-frontend

# Instalar dependencias necesarias
npm install react react-dom vite @chakra-ui/react @emotion/react @emotion/styled framer-motion react-icons leaflet

# Iniciar el servidor de desarrollo
npm run dev

El frontend estará disponible en: http://localhost:5173