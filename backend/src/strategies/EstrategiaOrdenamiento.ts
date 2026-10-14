import { Prestador } from '../models/Prestador';

// Interfaz que deben implementar todas las estrategias de ordenamiento
export interface IEstrategiaOrdenamiento {
  ordenar(prestadores: Prestador[], orden?: 'asc' | 'desc'): Prestador[];
}

// Estrategia: Ordenar por Calificación
export class OrdenarPorCalificacion implements IEstrategiaOrdenamiento {
  ordenar(prestadores: Prestador[], orden: 'asc' | 'desc' = 'desc'): Prestador[] {
    const factor = orden === 'asc' ? 1 : -1;
    return [...prestadores].sort(
      (a, b) =>
        factor * (a.calificacion - b.calificacion) ||
        a.apellido.localeCompare(b.apellido, 'es')
    );
  }
}

// Estrategia: Ordenar por Servicios / Rubro
export class OrdenarPorServicios implements IEstrategiaOrdenamiento {
  ordenar(prestadores: Prestador[], orden: 'asc' | 'desc' = 'asc'): Prestador[] {
    const factor = orden === 'asc' ? 1 : -1;
    return [...prestadores].sort(
      (a, b) =>
        factor * a.servicios.localeCompare(b.servicios, 'es') ||
        b.calificacion - a.calificacion
    );
  }
}

// Estrategia: Ordenar por Precio
export class OrdenarPorPrecio implements IEstrategiaOrdenamiento {
  ordenar(prestadores: Prestador[], orden: 'asc' | 'desc' = 'asc'): Prestador[] {
    const factor = orden === 'asc' ? 1 : -1;
    return [...prestadores].sort((a, b) => {
      // Los registros sin precio quedan al final, no se inventa un precio de cero.
      if (a.precio === undefined && b.precio === undefined) return 0;
      if (a.precio === undefined) return 1;
      if (b.precio === undefined) return -1;
      return factor * (a.precio - b.precio);
    });
  }
}

// Estrategia: Ordenar por Cercanía / Distancia
export class OrdenarPorCercania implements IEstrategiaOrdenamiento {
  ordenar(prestadores: Prestador[], orden: 'asc' | 'desc' = 'asc'): Prestador[] {
    const factor = orden === 'asc' ? 1 : -1;
    return [...prestadores].sort((a, b) => {
      // Los registros sin distancia quedan al final.
      if (a.distanciaKm === undefined && b.distanciaKm === undefined) return 0;
      if (a.distanciaKm === undefined) return 1;
      if (b.distanciaKm === undefined) return -1;
      return factor * (a.distanciaKm - b.distanciaKm);
    });
  }
}

// El Contexto que ejecuta la estrategia seleccionada
export class ContextoOrdenamiento {
  private estrategia?: IEstrategiaOrdenamiento;

  constructor(estrategia?: IEstrategiaOrdenamiento) {
    this.estrategia = estrategia;
  }

  public establecerEstrategia(estrategia: IEstrategiaOrdenamiento): void {
    this.estrategia = estrategia;
  }

  public ejecutar(prestadores: Prestador[], orden?: 'asc' | 'desc'): Prestador[] {
    if (!this.estrategia) {
      return prestadores;
    }
    return this.estrategia.ordenar(prestadores, orden);
  }
}