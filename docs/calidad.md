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
