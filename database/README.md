# Base de datos

El proyecto utiliza **PostgreSQL** como sistema gestor de base de datos.

## Requisitos

Cada integrante debe tener PostgreSQL instalado y ejecutándose localmente.

## Base de datos

Crear una base de datos llamada:

```text
proyecto_integrador
```

Las credenciales de conexión se configuran mediante las variables de entorno del proyecto.

## Estructura

```text
database/
├── migrations/
└── seeds/
```

### migrations

Contendrá los archivos necesarios para crear y modificar la estructura de la base de datos.

### seeds

Contendrá datos iniciales para facilitar las pruebas durante el desarrollo.

## Estado actual

La estructura definitiva de tablas y las migraciones se incorporarán durante el desarrollo del proyecto.