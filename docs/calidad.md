# Revisión y mejora de calidad

## Centralizar respuestas de error HTTP

### Problema

Los controladores de clientes, prestadores y visitas repetían la misma función para traducir errores a respuestas HTTP. Cualquier ajuste debía replicarse en tres lugares.

### Cambio

Se extrajo la función a `backend/src/controllers/responderError.ts` y se importó desde los tres controladores. No se modificaron las reglas de negocio.

### Contrato conservado

| Entrada | HTTP | Cuerpo JSON |
| --- | --- | --- |
| `Error` cuyo mensaje contiene `no encontrado` | 404 | `{ "mensaje": "<mensaje original>" }` |
| Otro `Error` | 400 | `{ "mensaje": "<mensaje original>" }` |
| Valor que no es `Error` | 400 | `{ "mensaje": "Error inesperado" }` |

### Beneficio y limitación

Hay una sola implementación de la traducción de errores. La clasificación por texto sigue siendo frágil: introducir errores tipados sería una mejora futura y no forma parte de este refactoring.

### Verificación

Desde la raíz del repositorio:

```bash
npm --prefix backend run build
npm --prefix backend start
```

Con el puerto predeterminado, comprobar las respuestas usando un cliente HTTP:

| Solicitud GET | Resultado esperado |
| --- | --- |
| `http://localhost:3000/api/clientes/id-inexistente` | 404 y mensaje de cliente no encontrado |
| `http://localhost:3000/api/prestadores/id-inexistente` | 404 y mensaje de prestador no encontrado |
| `http://localhost:3000/api/visitas/id-inexistente` | 404 y mensaje de visita no encontrada |
| `http://localhost:3000/api/prestadores?calificacionMinima=texto` | 400 y mensaje de filtro numérico |

## Controles de calidad

Desde la raíz del repositorio:

```bash
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix backend run lint
npm --prefix backend run typecheck
npm --prefix frontend run lint -- --max-warnings=0
npm --prefix backend run build
npm --prefix frontend run build
```

- **ESLint:** analiza patrones problemáticos con las reglas recomendadas de JavaScript y TypeScript. En frontend se incluyen también reglas de React. Se exige cero advertencias.
- **TypeScript:** comprueba contratos estáticos; `typecheck` no genera archivos. La compilación de ambas aplicaciones también verifica tipos.
- **Tests:** deben verificar comportamientos reales; lint y tipos no los reemplazan.

## Integración continua con GitHub Actions

Archivo: `.github/workflows/ci.yml`.

El workflow se ejecuta con pushes a `main` y `dev`, pull requests cuyo destino sea una de esas ramas, o manualmente desde **Actions**.

Usa dos jobs de una matriz, uno para backend y otro para frontend, con Ubuntu y Node.js 22. Cada job obtiene el código, instala dependencias con `npm ci`, ejecuta lint y compila. En backend también ejecuta `npm test` cuando existe ese script.

Si falla un comando, falla el job. El workflow no impide por sí mismo hacer merge: para exigir sus resultados deben configurarse comprobaciones obligatorias en las reglas de la rama de GitHub.

### Integración de las pruebas

Actualmente el backend no tiene un script `test`. Por eso el workflow publica una advertencia y un resumen de pruebas pendientes en lugar de simular una ejecución exitosa de tests.

El responsable de pruebas debe agregar el framework, los casos y el script `test`, que debe ejecutar la suite una sola vez, sin modo watch, y devolver un código de error si una prueba falla.

Al integrarse ese script, CI lo ejecutará automáticamente. Después debe reemplazarse la detección temporal por un paso obligatorio `npm test`, para que eliminar el script accidentalmente también haga fallar CI. **Una ejecución verde sin tests no acredita comportamientos probados.**

### Evidencia y resultados

Después de subir los cambios, abrir **Actions → Calidad del proyecto**, seleccionar la ejecución y revisar los pasos de ambos jobs. Un paso rojo permite identificar el comando y el mensaje de error; los pasos verdes acreditan únicamente los controles efectivamente ejecutados.

Guardar el enlace de la ejecución correspondiente al commit para la entrega. Las verificaciones locales no equivalen a una ejecución remota de Actions.

## CI/CD

- **Integración continua (CI):** verificar frecuentemente los cambios con controles automáticos; es lo implementado aquí.
- **Entrega continua:** mantener una versión validada lista para desplegar, con una decisión manual de publicación.
- **Despliegue continuo:** publicar automáticamente los cambios que superan los controles.

Este workflow no despliega. Para agregar CD habría que elegir un alojamiento, configurar el entorno y agregar un job de publicación dependiente de los controles exitosos. Cada reinicio del backend restablece los datos en memoria.
