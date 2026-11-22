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

### Almacenamiento

* Datos en memoria mediante `Map`.

---

## Requisitos

Para ejecutar el proyecto se necesita tener instalado:

* Node.js
* npm
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
├── .env.example           # Variables de entorno requeridas
├── .gitignore
└── README.md
```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/NCastellini/metodologia-2-grupo-7.git
cd metodologia-2-grupo-7
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

Crear un archivo `.env` a partir de `.env.example` ubicado en la raíz del proyecto:

### CMD
```bash
copy .env.example .env
```
### PowerShell
```bash
Copy-Item .env.example .env
```
### Linux
```bash
cp .env.example .env
```

Configurar `PORT` si se desea cambiar el puerto del backend. No se requieren credenciales de base de datos.

**El archivo `.env` no debe subirse al repositorio.**

---

## Almacenamiento en memoria

Los servicios guardan clientes, prestadores y visitas en memoria mediante `Map`. No se utiliza PostgreSQL ni se necesita instalar un gestor de base de datos.

Al reiniciar el backend se pierden los cambios, clientes y visitas creados durante la ejecución. Los prestadores iniciales se vuelven a cargar desde `backend/src/data/prestadores.json`; ese archivo no guarda las modificaciones realizadas por la API.

Los datos no se comparten entre distintos procesos del backend.

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

JWT_SECRET=super_secret
```

> Los valores reales de las variables de entorno son locales y no deben versionarse.

---

## Estado del proyecto

El proyecto se encuentra en la etapa inicial de configuración.

### Estado actual

* [x] Configuración inicial del frontend.
* [x] Configuración inicial del backend.
* [x] Almacenamiento en memoria.
* [x] Configuración de variables de entorno.
* [x] Configuración del repositorio.
* [x] Implementación del registro e inicio de sesión.
* [x] Implementación de perfiles.
* [x] Implementación de búsqueda de prestadores.
* [x] Implementación de solicitudes de visita.

### Próximos pasos

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
