# Trabajo práctico - Metodología 2 - Grupo 7
Integrantes:
- Castellini Nicolas
- Strizzi Román
- Peralta Julián

Nuestro proyecto consiste en un sistema de prestación de servicios para el hogar con dos roles principales, el de prestador de servicios y el de cliente.
El prestador de servicios puede crear su cuenta con su información y recibir peticiones de visita por parte de los clientes, mientras que los clientes pueden buscar el prestador de servicios que necesiten para solicitar una visita.

## Tecnologías

### Frontend

- React
- TypeScript
- CSS

### Backend

- Node.js
- Express
- TypeScript

### Base de datos

- PostgreSQL

## Roles

### Cliente

El cliente puede:

- Crear una cuenta.
- Iniciar sesión.
- Buscar prestadores de servicios.
- Consultar el perfil de un prestador.
- Solicitar una visita.
- Consultar el estado de sus solicitudes.

### Prestador de servicios

El prestador puede:

- Crear una cuenta.
- Completar su perfil profesional.
- Indicar los servicios que ofrece.
- Recibir solicitudes de visita.
- Aceptar o rechazar solicitudes.
- Consultar sus solicitudes.

## Estructura del proyecto

```
home-services/
├── frontend/       # Aplicación React
├── backend/        # API REST con Express
├── database/       # Migraciones y seeds de PostgreSQL
├── .env.example
├── .gitignore
└── README.md
```

## Requisitos

- Node.js
- npm
- PostgreSQL
- Git

## Instalación

Clonar el repositorio:

```bash
git clone <repository-url>
cd home-services
```

Instalar las dependencias del frontend:

```bash
cd frontend
npm install
```

Instalar las dependencias del backend:

```bash
cd ../backend
npm install
```

Configurar las variables de entorno a partir de `.env.example`.

## Desarrollo

Ejecutar el frontend:

```bash
cd frontend
npm run dev
```

Ejecutar el backend:

```bash
cd backend
npm run dev
```
