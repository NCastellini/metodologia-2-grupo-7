# Frontend · Consulta de prestadores

Interfaz en React + TypeScript + Vite que consulta los prestadores del backend,
permite filtrarlos por servicio y ordenarlos (calificación, precio, cercanía o servicio).

## Configurar la URL del backend

La URL se lee de la variable `VITE_API_URL`. Crear `frontend/.env` a partir del ejemplo:

```bash
cp .env.example .env          # Linux / Git Bash
copy .env.example .env        # CMD
Copy-Item .env.example .env   # PowerShell
```

```env
VITE_API_URL=http://localhost:3000
```

Si no se define, se usa `http://localhost:3000` (ver `src/config.ts`).
Si se cambia el `.env`, hay que reiniciar `npm run dev` para que Vite lo tome.

## Ejecutar

Primero levantar el backend (`cd backend && npm run dev`). Luego:

```bash
cd frontend
npm install
npm run dev     # abre en la URL que indica Vite (por defecto http://localhost:5173)
```

Otros comandos:

```bash
npm run lint    # controles de ESLint
npm run build   # compila TypeScript y genera dist/
```

## Qué muestra

| Situación | Qué ve el usuario |
|-----------|-------------------|
| Consulta en curso | "Cargando prestadores…" |
| Backend apagado o error de la API | Mensaje de error y botón **Reintentar** |
| Filtro sin coincidencias | "No se encontraron prestadores con ese filtro." |
| Hay resultados | Cantidad encontrada y tarjetas de cada prestador |

El filtrado y el ordenamiento los hace el backend (`GET /api/prestadores?servicios=...&ordenarPor=...&orden=...`),
que usa el patrón Strategy en `PrestadorService.filtrar`. El frontend solo arma la consulta y muestra el resultado.

## Estructura

```text
src/
├── config.ts                       # URL del backend
├── types/prestador.ts              # Tipos compartidos con la forma de la API
├── services/prestadoresApi.ts      # fetch a /api/prestadores y manejo de errores
├── components/FiltrosPrestadores.tsx
├── components/ListaPrestadores.tsx
└── App.tsx                         # Estados de carga, error, vacío y resultados
```

Los datos del backend están en memoria: los cambios se pierden al reiniciarlo.
