# Guía de Patrones de Diseño y Arquitectura

Este documento detalla la elección, justificación, ubicación dentro del código y descarte de los patrones de diseño y principios arquitectónicos aplicados en el proyecto del grupo 7 de Metodología de Sistemas II.

---

## 1. Principios SOLID y Arquitectura (Reaf, CC y SRP)

### Principio de Responsabilidad Única (SRP - Single Responsibility Principle)
* **¿Por qué lo elegimos?** Para evitar tener un archivo `index.js` (o punto de entrada) con demasiada responsabilidad, lo que dificultaría las pruebas, el mantenimiento y la escalabilidad del sistema.
* **¿Dónde lo ingresamos?** 
  * Las **rutas** están separadas en archivos específicos (ej. `routes/prestadores.routes.js`).
  * Los **controladores** concentran exclusivamente la lógica de negocio y la interacción con los servicios.
  * La **capa de persistencia/base de datos** está aislada en modelos o repositorios dedicados.
* **Código de Ejemplo:**
  ```javascript
  // routes/prestadores.routes.js
  const { Router } = require('express');
  const { obtenerPrestadores } = require('../controllers/prestadores.controller');
  const router = Router();

  router.get('/', obtenerPrestadores);

  module.exports = router;
  ```

---

## 2. Patrones Creacionales: Singleton

### Patrón Singleton
* **¿Por qué lo elegimos?** Para garantizar que exista una única instancia de conexión a la base de datos en toda la aplicación, evitando aperturas y cierres innecesarios de conexiones y optimizando recursos.
* **¿Dónde lo ingresamos?** En el módulo de configuración o conexión a la base de datos (ej. `config/database.js` o `db/connection.js`).
* **Código de Ejemplo:**
  ```javascript
  // config/database.js
  const mongoose = require('mongoose');

  class DatabaseConnection {
    constructor() {
      if (!DatabaseConnection.instance) {
        this.connect();
        DatabaseConnection.instance = this;
      }
      return DatabaseConnection.instance;
    }

    async connect() {
      try {
        await mongoose.connect(process.env.DB_URI);
        console.log("Conexión a la base de datos establecida (Singleton)");
      } catch (error) {
        console.error("Error de conexión a la BD:", error);
      }
    }
  }

  const instance = new DatabaseConnection();
  Object.freeze(instance);

  module.exports = instance;
  ```

---

## 3. Patrones Estructurales: Facade y Adapter

### A. Patrón Facade (Fachada)
* **¿Por qué lo elegimos?** Para simplificar la complejidad de las consultas o llamadas directas a la base de datos o múltiples servicios, proveyendo una interfaz unificada y limpia para los controladores.
* **¿Dónde lo ingresamos?** En una clase de servicio o fachada (ej. `services/PrestadorFacade.js`).
* **Código de Ejemplo:**
  ```javascript
  // services/PrestadorFacade.js
  const PrestadorModel = require('../models/prestador.model');

  class PrestadorFacade {
    async buscarYFiltrar(criterios) {
      // Simplifica la complejidad de armar queries compuestas en Mongoose/SQL
      return await PrestadorModel.find(criterios);
    }
  }

  module.exports = new PrestadorFacade();
  ```

### B. Patrón Adapter (Adaptador)
* **¿Por qué lo elegimos?** Para desacoplar nuestro sistema de APIs externas (como geolocalización o pasarelas de pago tipo MercadoPago), permitiendo cambiar de proveedor en el futuro sin modificar la lógica interna de la aplicación.
* **¿Dónde lo ingresamos?** En la capa de adaptadores externos (ej. `adapters/MercadoPagoAdapter.js`).
* **Código de Ejemplo:**
  ```javascript
  // adapters/MercadoPagoAdapter.js
  class MercadoPagoAdapter {
    async crearPreferenciaPago(datosPago) {
      // Aquí se llamaría al SDK real de MercadoPago
      // Si mañana cambiamos a Stripe, solo modificamos este adaptador.
      return { idPreferencia: "mp_pref_12345", init_point: "https://mercadopago.com/checkout..." };
    }
  }

  module.exports = MercadoPagoAdapter;
  ```

---

## 4. Patrones de Comportamiento: Strategy

### Patrón Strategy
* **¿Por qué lo elegimos?** Para manejar dinámicamente las distintas formas de ordenar y buscar a los prestadores (por precio, por cercanía o por valoración) sin saturar el controlador con estructuras `if/else` o `switch`.
* **¿Dónde lo ingresamos?** En la lógica de búsqueda y ordenamiento de prestadores (ej. `strategies/OrdenamientoContext.js`).
* **Código de Ejemplo:**
  ```javascript
  // strategies/ordenamiento.strategy.js
  class OrdenPorPrecio {
    ordenar(prestadores) {
      return prestadores.sort((a, b) => a.precio - b.precio);
    }
  }

  class OrdenPorCercania {
    ordenar(prestadores) {
      return prestadores.sort((a, b) => a.distancia - b.distancia);
    }
  }

  class OrdenPorValoracion {
    ordenar(prestadores) {
      return prestadores.sort((a, b) => b.valoracion - a.valoracion);
    }
  }

  class OrdenamientoContext {
    constructor(strategy) {
      this.strategy = strategy;
    }

    setStrategy(strategy) {
      this.strategy = strategy;
    }

    ejecutarOrden(prestadores) {
      return this.strategy.ordenar(prestadores);
    }
  }

  module.exports = { OrdenPorPrecio, OrdenPorCercania, OrdenPorValoracion, OrdenamientoContext };
  ```

---

## 5. Justificación del Descarte de Otros Patrones

* **Prototype / Builder (Creacionales):** Fueron descartados porque la creación de entidades en nuestro dominio (como prestadores o usuarios) no requiere una complejidad de construcción por pasos tan elevada ni clonación masiva de objetos en memoria.
* **Decorator / Proxy (Estructurales):** Se evaluaron para control de acceso, pero se prefirió delegar esa responsabilidad en middlewares nativos de Express (como autenticación por JWT) para mantener el código más liviano y estándar.
* **Observer / State (Comportamiento):** Se descartaron ya que el flujo de la aplicación es principalmente síncrono basado en peticiones HTTP (REST API), sin requerir eventos complejos en tiempo real o máquinas de estados complejas para las entidades principales en esta etapa del proyecto.