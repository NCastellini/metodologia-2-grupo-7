# Decisiones de diseño — Grupo 7 · Metodología de Sistemas II · Taller II

Criterio del grupo: un patrón se aplica solo si resuelve un problema presente en el código o inminente en la próxima etapa. Conocer un patrón no alcanza para usarlo. Rutas relativas a `backend/src/`. Estado: **aplicado** (ya está en el código) o **previsto** (se incorpora con la BD o las APIs).

## 1. Código analizado

| Decisión | Estado | Archivos |
|----------|--------|----------|
| Strategy (ordenar prestadores) | Aplicado | `strategies/EstrategiaOrdenamiento.ts`, `services/PrestadorService.ts` (`filtrar`), `controllers/prestadorController.ts` (`listarPrestadores`) |
| Singleton (instancia única) | Aplicado | `db/conexion.ts` (un único `Pool` de PostgreSQL, aún sin consumidores) y `serviceContainer.ts` (instancia única de cada servicio) |
| SRP (capas separadas) | Aplicado | `routes/`, `controllers/`, `services/`, `models/`, `db/`, `strategies/`; `index.ts` solo configura Express y monta rutas |
| Facade (acceso a la BD) | Previsto | A crear al migrar los servicios de memoria a PostgreSQL |
| Adapter (geolocalización / MercadoPago) | Previsto | A crear al integrar cada API (hoy no hay dependencias externas) |

## 2. Diagnóstico y 4. Decisión: por qué estos patrones

- **Strategy:** ordenar por precio, cercanía, calificación y rubro son 4 variantes de una misma operación, con reglas propias (desempates, datos faltantes, asc/desc). Sin el patrón, `filtrar()` mezclaría filtrado con 4 algoritmos y cada criterio nuevo obligaría a modificarlo (Clase 6). **Se mantiene.** Smells detectados (Clase 7) y refactorings propuestos: duplicación del cálculo del factor de orden y de la regla "sin dato al final" (Extract Method); mapa de estrategias creado en cada llamada y tipado como `string` (moverlo a nivel de módulo con un tipo `CriterioOrden`); lista de criterios y rango de calificación 0–5 validados en el controlador y también en el servicio (conviene una sola fuente de verdad).
- **Singleton:** la conexión a PostgreSQL debe ser una sola para no abrir conexiones de más, y los servicios guardan el estado en memoria, así que una segunda instancia duplicaría los datos (Clase 4). Se resuelve con instancias exportadas desde un módulo, que Node cachea, sin la ceremonia del Singleton GoF. Costo: estado global compartido. Hoy `db/conexion.ts` todavía no es usado por ningún servicio.
- **SRP:** la ruta define el endpoint, el controlador traduce HTTP y valida la entrada, el servicio concentra las reglas de negocio y la conexión vive aparte (Clase 7). Límite actual: `PrestadorService` mezcla CRUD, validación y filtrado; se acepta mientras la persistencia sea en memoria y se separa en un repositorio al llegar la BD.
- **Facade (previsto):** servicios y controladores no deberían conocer `pg` ni armar consultas. Una fachada de datos les daría una interfaz simple (Clase 5). Hoy no corresponde: no hay subsistema que ocultar, y envolver un `Map` solo renombraría métodos.
- **Adapter (previsto):** para geolocalización y pagos se definirá un contrato propio y un adaptador por proveedor, de modo que cambiar de proveedor toque un solo lugar (Clase 5). Hoy no se implementa porque no hay API que adaptar.

## 3. Alternativas consideradas

- **Strategy:** `switch` dentro de `filtrar()` (crece con cada criterio) u objeto de funciones comparadoras (pierde interfaz común y es poco extensible con desempates y contexto, como la ubicación del cliente).
- **Singleton:** Singleton GoF (más ceremonia y acoplamiento) o `new` en cada consumidor (rompe la consistencia del estado).
- **Facade / Adapter:** llamar directo a `pg` o al SDK del proveedor; descartado porque propaga detalles externos por todo el sistema.

## 5. Evidencia y trade-offs

- **Beneficios:** menor acoplamiento, criterios de orden probables por separado, cambio de proveedor localizado y capas con una sola razón de cambio.
- **Costos:** más clases y capas para 4 comparadores; estado global en servicios y conexión; Facade y Adapter agregan indirección que solo se paga cuando existan BD y APIs reales.
- **Riesgo abierto:** con geolocalización real, "cercanía" dependerá de la ubicación del cliente y habrá que ampliar la interfaz de Strategy.
- **Evidencia:** archivos de la sección 1 

## Por qué no otros patrones

- **Factory:** la creación es directa (`new ClienteService()`) y la única selección de variantes ya está en el mapa de estrategias.
- **Builder:** `Prestador`, `Cliente` y `Visita` son objetos de pocos campos; `Omit` y spread alcanzan, sin construcción por pasos.
- **Decorator / Proxy:** no hay comportamientos combinables (logging, reintentos); el control de acceso se resolvería con middlewares de Express.
- **Observer:** hoy cambiar el estado de una `Visita` no dispara reacciones. Sería el primer candidato si aparecen notificaciones.
- **Command / State:** no hay acciones para guardar o deshacer, ni máquinas de estado complejas en esta etapa.
