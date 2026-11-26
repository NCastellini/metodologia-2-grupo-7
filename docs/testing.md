# Pruebas automatizadas — búsqueda y ordenamiento de prestadores

## Cómo ejecutarlas

```bash
npm install             # dentro de la carpeta backend o frontend
npm test                # se corre por separado en el backend y en el frontend
npm run test:coverage   # agrega reporte de cobertura
```

Se usa **Vitest** con una sola configuración (`vitest.config.ts`) dividida en dos proyectos:

| Proyecto   | Entorno | Archivos                         | Por qué ese entorno |
|------------|---------|----------------------------------|---------------------|
| `backend`  | node    | `backend/src/tests/*.test.ts`    | Lógica pura, sin navegador |
| `frontend` | jsdom   | `frontend/src/tests/*.test.{ts,tsx}` | Los componentes React necesitan un DOM |

## Qué se prueba y por qué en esos niveles

El filtrado y el ordenamiento **no** se hacen en el navegador: el frontend arma una consulta
`GET /api/prestadores?servicios=…&ordenarPor=…&orden=…` y muestra lo que devuelve el backend
(`PrestadorService.filtrar` + patrón Strategy). Por eso las pruebas cubren tres capas:

1. **Backend (donde vive la lógica):** `PrestadorService.filtrar` y `EstrategiaOrdenamiento`. Es el respaldo principal.
2. **Contrato frontend → backend:** `prestadoresApi.ts` arma bien la consulta y traduce errores.
3. **Comportamiento visible:** `App` y `ListaPrestadores` muestran lo correcto (lista, "Sin precio", "sin resultados").

Los datos de prueba (`src-backend/tests/fixtures.ts`) son un dataset chico y controlado, **no** `prestadores.json`:
en el JSON actual **ninguno de los 50 prestadores tiene `precio` ni `distanciaKm`**, así que no serviría para probar
el ordenamiento por precio. Cada registro del fixture existe por un motivo (documentado en el archivo): empate de calificación,
tildes, precio 0, sin precio, calificación 0, etc. Además `datosReales.test.ts` verifica lo mismo contra el JSON real.

## Casos y justificación

### 1. Filtrado por servicio — `filtradoPorServicio.test.ts`

| Caso | Justificación |
|------|---------------|
| Devuelve solo el servicio pedido (varios / uno solo) | Es la función central del `<select>` de la interfaz. |
| Sin filtro o servicio `''` devuelve todos | El frontend usa `''` para "Todos"; si vaciara la lista sería un bug visible. |
| Espacios alrededor del servicio | El backend hace `trim()`; evita fallos por entradas pegadas o escritas a mano. |
| Combinado con calificación mínima / máxima | Los filtros se acumulan; un `&&` mal puesto los volvería excluyentes. |
| Límites de calificación inclusivos (4 a 4) | Errores de `<` vs `<=` son los más comunes en rangos. |
| Un fragmento ("Plom") **no** coincide | Documenta el comportamiento actual (coincidencia exacta normalizada). Si se agrega búsqueda parcial, este test avisa que cambió el contrato. |
| No modifica los datos almacenados | `filtrar` ordena sobre una copia; modificar el original afectaría a otras consultas. |

### 2. Mayúsculas y tildes — `filtradoPorServicio.test.ts`

Casos parametrizados: `plomeria`, `PLOMERÍA`, `PLOMERIA`, `pLoMeRíA`, `jardineria`, `instalacion de pisos`,
`INSTALACIÓN DE PISOS`, `Gásista`.

| Caso | Justificación |
|------|---------------|
| Minúsculas, mayúsculas y mezcla | El usuario no debería perder resultados por la capitalización. |
| Sin tilde en la búsqueda, con tilde en el dato (y al revés) | Los datos están en español con tildes (Plomería, Jardinería…); mucha gente escribe sin ellas. |
| Servicios de varias palabras | Verifica que la normalización no solo funciona en palabras sueltas. |
| Tilde en forma descompuesta Unicode (`i` + U+0301) | Según teclado/sistema operativo, la misma letra puede llegar con dos codificaciones distintas. |
| Normaliza también el dato guardado (`ALBAÑILERÍA`) | Asegura que la comparación es simétrica. |
| `Plomeros` ≠ `Plomería` | Quitar tildes no debe generar falsos positivos. |

### 3. Búsqueda sin resultados — `filtradoPorServicio.test.ts` y `App.test.tsx`

| Caso | Justificación |
|------|---------------|
| Servicio inexistente → `[]`, sin excepción | El frontend espera una lista vacía, no un error. |
| Calificación mínima fuera de rango, mín > máx, servicio + calificación excluyentes | Distintas formas de llegar a vacío; todas deben comportarse igual. |
| Ordenar un resultado vacío con los 4 criterios | Un `sort` sobre `[]` no debe fallar ni acceder a campos inexistentes. |
| Servicio sin prestadores cargados | Estado inicial del sistema. |
| **Frontend:** muestra "No se encontraron prestadores con ese filtro." y oculta la lista y el contador | Es lo que ve el usuario; sin mensaje parecería que la página no cargó. |

### 4. Ordenamiento por calificación — `ordenamiento.test.ts`

| Caso | Justificación |
|------|---------------|
| Por defecto: mayor a menor | Es el criterio por defecto de la estrategia (el mejor calificado primero). |
| `asc` y `desc` explícitos | Verifica ambos sentidos con valores reales incluidos 0, 4.5 y 5. |
| Desempate por apellido (también con tilde: Álvarez antes que Benítez) | Sin desempate el orden de iguales sería arbitrario; `localeCompare('es')` evita que "Á" vaya al final. |
| Se aplica después del filtro de servicio | Orden de operaciones: filtrar y luego ordenar. |
| No muta el arreglo de entrada | La estrategia ordena una copia. |

### 5. Ordenamiento por precio y prestadores sin precio — `ordenamiento.test.ts`

| Caso | Justificación |
|------|---------------|
| `asc` (por defecto) y `desc` | Sentido correcto del criterio. |
| **Sin precio al final en `asc`** | Regla de negocio explícita en el código: no se inventa un precio. |
| **Sin precio al final también en `desc`** | Es el error más probable: al invertir el signo, los `undefined` podrían saltar al principio. |
| Sin precio ≠ precio 0 | Un prestador con precio 0 (p. ej., presupuesto gratis) debe aparecer antes que uno sin dato. |
| Precio 0 es un valor válido | `if (!precio)` en vez de `=== undefined` lo trataría como faltante. |
| No se pierden registros | Total conservado tras ordenar. |
| Todos sin precio → mismo orden, sin error | Es el caso real hoy (ver `datosReales.test.ts`). |
| Subconjunto filtrado con y sin precio | La regla se mantiene dentro de un filtro por servicio. |
| **Frontend:** "Sin precio" se muestra para los que faltan; "$ 0" no se confunde con faltante | Lo que ve el usuario al ordenar por precio. |

### 6. Otras pruebas de apoyo

- **Servicios (A-Z) y cercanía:** también están en el selector del frontend; cercanía repite la regla "sin dato al final".
- **Sin criterio o criterio desconocido:** conserva el orden de carga (el controlador ya valida con 400).
- **`ContextoOrdenamiento`:** sin estrategia no toca la lista y permite cambiar de estrategia en tiempo de ejecución (OCP/Strategy).
- **`prestadoresApi.test.ts`:** "Todos" no envía `servicios`; tildes y espacios codificados; `orden` solo viaja con `ordenarPor`; mensajes de error 400/500/red.
- **`App.test.tsx`:** flujo completo con un backend simulado: select de servicios sin duplicados, filtrar, volver a "Todos", ordenar por calificación, selector "Orden" deshabilitado sin criterio, error con "Reintentar".

## Verificación de que las pruebas detectan fallos

Se rompió el código a propósito y las pruebas fallaron como corresponde:

| Defecto introducido | Resultado |
|---|---|
| Quitar la normalización de tildes en `normalizar` | 8 pruebas fallan |
| Tratar "sin precio" como 0 al ordenar | 4 pruebas fallan |
| Invertir el sentido del orden por calificación | 6 pruebas fallan |

## Alcance y limitaciones

- La cobertura de `EstrategiaOrdenamiento.ts` es 100 %. `PrestadorService.ts` queda en ~66 % porque
  las pruebas **no** cubren el CRUD (`crear`, `actualizar`, `eliminar`, validaciones), que está fuera del alcance de esta tarea.
  La cobertura total es ~78%.
- No se prueba el controlador HTTP (`prestadorController`) ni se levanta el servidor Express; el contrato HTTP se verifica
  del lado del frontend (`prestadoresApi.test.ts`) y la lógica del lado del servicio.
- Los tests de `App` usan un backend simulado (`fetch` falso): validan el comportamiento de la interfaz, no la integración real por red.