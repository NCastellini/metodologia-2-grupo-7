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

## Estado actual

Las funcionalidades descritas arriba son el objetivo del proyecto; **no todas están implementadas**.

- **Frontend (React, TypeScript, Vite):** lista prestadores, filtra por servicio y ordena por calificación, precio, cercanía o servicio. Muestra carga, errores, resultados vacíos y botón para reintentar.
- **Backend (Node.js, Express, TypeScript):** API de clientes, prestadores y visitas con reglas de validación; `PrestadorService.filtrar` usa estrategias de ordenamiento. El frontend consume `GET /api/prestadores`.
- **Datos:** los servicios usan `Map` en memoria. Los prestadores iniciales están en `backend/src/data/prestadores.json`. Las altas y modificaciones se pierden al reiniciar el backend y no se comparten entre procesos. No se necesita PostgreSQL.
- **Limitaciones:** no hay registro ni inicio de sesión; la interfaz no permite crear visitas ni gestionar solicitudes. Precio y distancia son campos opcionales y no están presentes en los prestadores iniciales; la aplicación no calcula distancias reales.

## Instalación

Se recomienda Node.js 22, la versión utilizada en integración continua. Desde la raíz del repositorio:

```bash
git clone https://github.com/NCastellini/metodologia-2-grupo-7.git
cd metodologia-2-grupo-7
npm --prefix backend ci
npm --prefix frontend ci
```

Cada parte tiene su propio `package.json` y `package-lock.json`. Los comandos se ejecutan desde la **raíz**.

## Configuración y ejecución

El backend utiliza `PORT=3000` por defecto. Si necesitás otro puerto, copiá `.env.example` a `.env` **en la raíz** y cambiá `PORT`. Para que el frontend se conecte a ese puerto, copiá también `frontend/.env.example` a `frontend/.env` y ajustá `VITE_API_URL` (sin barra final).

```powershell
# PowerShell
Copy-Item .env.example .env
Copy-Item frontend/.env.example frontend/.env
```

```bash
# Linux / macOS / Git Bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Abrí **dos terminales en la raíz**:

```bash
# Terminal 1: API
npm --prefix backend run dev
```

```bash
# Terminal 2: interfaz
npm --prefix frontend run dev
```

Abrí la URL que muestra Vite (normalmente `http://localhost:5173`). La API usa `http://localhost:3000` por defecto. Si la API no responde, la interfaz mostrará un mensaje y permitirá reintentar.

## Demostración

1. Con ambos servidores en marcha, abrir la interfaz y consultar la lista de prestadores.
2. Elegir un servicio, después un criterio y sentido de orden. El frontend envía la consulta y el backend filtra y ordena.
3. Mostrar directamente las respuestas de la API en un navegador:

```text
http://localhost:3000/
http://localhost:3000/api/prestadores
http://localhost:3000/api/prestadores?servicios=Gasista&ordenarPor=calificacion&orden=desc
http://localhost:3000/api/prestadores/1
```

Los endpoints se definen en `backend/src/routes/` (`/api/clientes`, `/api/prestadores`, `/api/visitas`). Admiten `GET /`, `GET /:id`, `POST /`, `PUT /:id` y `DELETE /:id`. Los modelos del cuerpo JSON están en `backend/src/models/`. Para crear una visita se necesitan cliente y prestador existentes. La disponibilidad evita dos visitas **no canceladas** con mismo prestador, fecha y hora exacta; no calcula superposiciones por duración.

## Pruebas y calidad

```bash
npm --prefix backend test
npm --prefix frontend test
npm --prefix backend run lint
npm --prefix backend run typecheck
npm --prefix frontend run lint -- --max-warnings=0
npm --prefix backend run build
npm --prefix frontend run build
```

Los tests usan Vitest y se ejecutan una sola vez con `npm test`. Los del backend verifican búsqueda, normalización y ordenamiento; los del frontend comprueban la consulta a la API y lo que ve el usuario con respuestas simuladas. **No levantan un servidor real**. Casos, decisiones, limitaciones y cobertura: [Pruebas](docs/testing.md).

ESLint y TypeScript aportan controles estáticos; no reemplazan los tests. La mejora de código y el workflow de CI están documentados en [Calidad e integración continua](docs/calidad.md). GitHub Actions comprueba instalación, lint, tests y compilación en pushes y pull requests hacia `dev` o `main`; no despliega el proyecto.

## Dónde encontrar cada parte

| Ubicación | Contenido |
| --- | --- |
| `frontend/src/` | Interfaz, componentes y cliente HTTP |
| `backend/src/routes/` y `backend/src/controllers/` | Endpoints y respuestas HTTP |
| `backend/src/services/` y `backend/src/strategies/` | Reglas de negocio y criterios de ordenamiento |
| `backend/src/tests/` y `frontend/src/tests/` | Tests automatizados |
| `docs/decisiones-diseño.md` | Decisiones técnicas y sus alternativas |
| `.github/workflows/ci.yml` | Automatización de verificaciones |

## Integrantes

- Castellini Nicolas
- Strizzi Román
- Peralta Julián
