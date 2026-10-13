# Proyecto Integrador

Sistema de prestación de servicios para el hogar.

## Descripción

Nuestro proyecto consiste en un sistema de prestación de servicios para el hogar con dos roles principales, el de prestador de servicios y el de cliente. El prestador de servicios puede crear su cuenta con su información y recibir peticiones de visita por parte de los clientes, mientras que los clientes pueden buscar el prestador de servicios que necesiten para solicitar una visita.

El objetivo es facilitar la búsqueda y contratación de servicios para el hogar mediante una plataforma centralizada.

---

## Funcionalidades

### Cliente

El cliente podrá:

* Crear una cuenta.
* Iniciar sesión.
* Buscar prestadores de servicios.
* Consultar el perfil de un prestador.
* Solicitar una visita.
* Consultar el estado de sus solicitudes.

### Prestador de servicios

El prestador podrá:

* Crear una cuenta.
* Iniciar sesión.
* Completar su perfil profesional.
* Indicar los servicios que ofrece.
* Recibir solicitudes de visita.
* Aceptar o rechazar solicitudes.
* Consultar sus solicitudes.

---

## Tecnologías

### Frontend

* React
* TypeScript
* CSS
* Vite

### Backend

* Node.js
* Express
* TypeScript

### Base de datos

* PostgreSQL

---

## Requisitos

Para ejecutar el proyecto se necesita tener instalado:

* Node.js
* npm
* PostgreSQL
* Git

---

## Estructura del proyecto

```text
proyecto-integrador/
│
├── frontend/              # Aplicación React
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
├── backend/               # API REST con Express
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
├── database/              # Base de datos
│   ├── migrations/
│   ├── seeds/
│   └── README.md
│
├── .env.example           # Variables de entorno requeridas
├── .gitignore
└── README.md
```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/NCastellini/metodologia-2-grupo-7.git
cd proyecto-integrador
```

### 2. Instalar dependencias del frontend

```bash
cd frontend
npm install
```

### 3. Instalar dependencias del backend

```bash
cd ../backend
npm install
```

### 4. Configurar las variables de entorno

Crear un archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Completar las variables necesarias según la configuración local de PostgreSQL.

**El archivo `.env` no debe subirse al repositorio.**

---

## Base de datos

El proyecto utiliza PostgreSQL.

Cada integrante debe tener una instancia local de PostgreSQL disponible.

La configuración de conexión se encuentra definida mediante variables de entorno.

Las migraciones y seeds del proyecto se almacenarán en:

```text
database/
├── migrations/
└── seeds/
```

La estructura y los pasos necesarios para preparar la base de datos se documentarán en `database/README.md`.

---

## Ejecución en desarrollo

### Frontend

Desde la carpeta `frontend`:

```bash
npm run dev
```

La aplicación estará disponible en la dirección indicada por Vite en la terminal.

### Backend

Desde la carpeta `backend`:

```bash
npm run dev
```

La API estará disponible en el puerto configurado mediante las variables de entorno.

---

## Variables de entorno

Las variables necesarias se encuentran documentadas en:

```text
.env.example
```

Ejemplo:

```env
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=proyecto_integrador
DATABASE_USER=postgres
DATABASE_PASSWORD=password

JWT_SECRET=super_secret
```

> Los valores reales de las variables de entorno son locales y no deben versionarse.

---

## Estado del proyecto

El proyecto se encuentra en la etapa inicial de configuración.

### Estado actual

* [x] Configuración inicial del frontend.
* [x] Configuración inicial del backend.
* [x] Configuración inicial de PostgreSQL.
* [x] Configuración de variables de entorno.
* [x] Configuración del repositorio.

### Próximos pasos

* [ ] Diseño de la base de datos.
* [ ] Implementación del registro e inicio de sesión.
* [ ] Implementación de perfiles.
* [ ] Implementación de búsqueda de prestadores.
* [ ] Implementación de solicitudes de visita.
* [ ] Gestión de solicitudes por parte del prestador.
* [ ] Integración frontend/backend.
* [ ] Pruebas del sistema.

---

## Integrantes

- Castellini Nicolas
- Strizzi Román
- Peralta Julián

---

## Repositorio

Repositorio del proyecto:

```text
https://github.com/NCastellini/metodologia-2-grupo-7.git
```

---
##  Arquitectura y Patrones de Diseño

Para el módulo de gestión, filtrado y búsqueda de prestadores en el backend, se implementó el **Patrón de Diseño Strategy** con el fin de cumplir estrictamente con el **Principio de Abierto/Cerrado (OCP)** de SOLID.

### ¿Cómo funciona?
* **Interfaz Común (`IEstrategiaOrdenamiento`):** Define el contrato que todas las formas de ordenamiento deben cumplir.
* **Estrategias Concretas:** Se separaron los algoritmos de ordenamiento en clases independientes y desacopladas:
  * **OrdenarPorCalificacion:** Prioriza la puntuación del prestador.
  * **OrdenarPorServicios:** Agrupa y ordena por coincidencia de rubro o servicio.
  * **OrdenarPorPrecio:** Ordena los prestadores según su tarifa/precio por hora.
  * **OrdenarPorCercania:** Ordena basándose en la distancia en kilómetros respecto al cliente.
* **Contexto (`ContextoOrdenamiento`):** Permite cambiar de estrategia de forma dinámica en tiempo de ejecución según el parámetro recibido en las peticiones, evitando el uso de estructuras condicionales rígidas (`if/else` o `switch`) en la lógica de negocio principal (`PrestadorService`).
