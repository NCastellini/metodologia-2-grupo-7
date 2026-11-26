import { describe, it, expect } from 'vitest';
import { crearServicio, ids, PRESTADORES } from './fixtures';
import { PrestadorService } from '../services/PrestadorService';
import {
  ContextoOrdenamiento,
  OrdenarPorCalificacion,
  OrdenarPorCercania,
  OrdenarPorPrecio,
  OrdenarPorServicios,
} from '../strategies/EstrategiaOrdenamiento';

describe('Ordenamiento por calificación', () => {
  it('por defecto ordena de mayor a menor', () => {
    const resultado = crearServicio().filtrar({ ordenarPor: 'calificacion' });
    expect(resultado.map((p) => p.calificacion)).toEqual([5, 4.5, 4, 4, 3, 2, 0]);
  });

  it('desc: mejor calificado primero', () => {
    const resultado = crearServicio().filtrar({ ordenarPor: 'calificacion', orden: 'desc' });
    expect(resultado[0].id).toBe('p3');
    expect(resultado.at(-1)?.id).toBe('p7');
  });

  it('asc: peor calificado primero', () => {
    const resultado = crearServicio().filtrar({ ordenarPor: 'calificacion', orden: 'asc' });
    expect(resultado.map((p) => p.calificacion)).toEqual([0, 2, 3, 4, 4, 4.5, 5]);
  });

  it('ante igual calificación desempata por apellido (A-Z, respetando tildes)', () => {
    // p4 Rossi y p5 Benítez tienen 4: Benítez va primero en ambos sentidos.
    const desc = crearServicio().filtrar({ ordenarPor: 'calificacion', orden: 'desc' });
    const asc = crearServicio().filtrar({ ordenarPor: 'calificacion', orden: 'asc' });
    expect(ids(desc).indexOf('p5')).toBeLessThan(ids(desc).indexOf('p4'));
    expect(ids(asc).indexOf('p5')).toBeLessThan(ids(asc).indexOf('p4'));
  });

  it('el desempate considera "Á" como "A" (Álvarez antes que Benítez)', () => {
    const base = { nombre: 'N', servicios: 'X', calificacion: 3, telefono: 1 };
    const servicio = new PrestadorService();
    servicio.cargarInicial({ ...base, id: 'a', apellido: 'Benítez', email: 'a@m.com' });
    servicio.cargarInicial({ ...base, id: 'b', apellido: 'Álvarez', email: 'b@m.com' });
    expect(ids(servicio.filtrar({ ordenarPor: 'calificacion' }))).toEqual(['b', 'a']);
  });

  it('respeta el filtro por servicio antes de ordenar', () => {
    const resultado = crearServicio().filtrar({
      servicios: 'plomeria', ordenarPor: 'calificacion', orden: 'desc',
    });
    expect(ids(resultado)).toEqual(['p3', 'p1', 'p2']);
  });

  it('no altera el orden de los datos de entrada', () => {
    const entrada = [...PRESTADORES];
    new OrdenarPorCalificacion().ordenar(entrada, 'asc');
    expect(entrada).toEqual(PRESTADORES);
  });
});

describe('Ordenamiento por precio', () => {
  const precios = (lista: { precio?: number }[]) => lista.map((p) => p.precio);

  it('asc: del más barato al más caro', () => {
    const conPrecio = crearServicio().filtrar({ ordenarPor: 'precio', orden: 'asc' })
      .filter((p) => p.precio !== undefined);
    expect(precios(conPrecio)).toEqual([0, 8000, 12000, 15000, 20000]);
  });

  it('por defecto ordena ascendente', () => {
    const conPrecio = crearServicio().filtrar({ ordenarPor: 'precio' })
      .filter((p) => p.precio !== undefined);
    expect(precios(conPrecio)).toEqual([0, 8000, 12000, 15000, 20000]);
  });

  it('desc: del más caro al más barato', () => {
    const conPrecio = crearServicio().filtrar({ ordenarPor: 'precio', orden: 'desc' })
      .filter((p) => p.precio !== undefined);
    expect(precios(conPrecio)).toEqual([20000, 15000, 12000, 8000, 0]);
  });

  describe('prestadores sin precio', () => {
    it('asc: quedan al final, después de todos los que tienen precio', () => {
      const resultado = crearServicio().filtrar({ ordenarPor: 'precio', orden: 'asc' });
      expect(precios(resultado.slice(0, 5)).every((p) => p !== undefined)).toBe(true);
      expect(precios(resultado.slice(5))).toEqual([undefined, undefined]);
      expect(ids(resultado.slice(5)).sort()).toEqual(['p3', 'p5']);
    });

    it('desc: también quedan al final (no pasan al principio al invertir)', () => {
      const resultado = crearServicio().filtrar({ ordenarPor: 'precio', orden: 'desc' });
      expect(precios(resultado.slice(0, 5)).every((p) => p !== undefined)).toBe(true);
      expect(precios(resultado.slice(5))).toEqual([undefined, undefined]);
    });

    it('no se interpretan como precio 0: no aparecen antes que uno gratuito', () => {
      const resultado = crearServicio().filtrar({ ordenarPor: 'precio', orden: 'asc' });
      expect(resultado[0].id).toBe('p6'); // precio 0 real
      expect(ids(resultado).indexOf('p3')).toBeGreaterThan(ids(resultado).indexOf('p6'));
    });

    it('no se pierden: el total de prestadores se conserva', () => {
      expect(crearServicio().filtrar({ ordenarPor: 'precio' })).toHaveLength(7);
    });

    it('si ninguno tiene precio, conserva el orden original y no falla', () => {
      const sinPrecio = PRESTADORES.filter((p) => p.precio === undefined);
      const resultado = crearServicio(sinPrecio).filtrar({ ordenarPor: 'precio', orden: 'desc' });
      expect(ids(resultado)).toEqual(['p3', 'p5']);
    });

    it('con un servicio filtrado, los sin precio van al final de ese subconjunto', () => {
      const resultado = crearServicio().filtrar({ servicios: 'Plomería', ordenarPor: 'precio', orden: 'asc' });
      expect(ids(resultado)).toEqual(['p2', 'p1', 'p3']);
    });
  });

  it('un precio 0 es un dato válido y se ordena como número', () => {
    const asc = crearServicio().filtrar({ ordenarPor: 'precio', orden: 'asc' });
    const desc = crearServicio().filtrar({ ordenarPor: 'precio', orden: 'desc' });
    expect(asc[0].id).toBe('p6');
    expect(ids(desc.filter((p) => p.precio !== undefined)).at(-1)).toBe('p6');
  });
});

describe('Otros criterios y casos generales', () => {
  it('sin criterio de orden conserva el orden de carga', () => {
    expect(ids(crearServicio().filtrar())).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']);
  });

  it('el campo "orden" solo se aplica junto con "ordenarPor"', () => {
    expect(ids(crearServicio().filtrar({ orden: 'desc' }))).toEqual(
      ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'],
    );
  });

  it('un criterio desconocido se ignora y no ordena', () => {
    const resultado = crearServicio().filtrar({ ordenarPor: 'inexistente' as never });
    expect(ids(resultado)).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']);
  });

  it('servicios: A-Z respetando tildes y desempata por mejor calificación', () => {
    const resultado = crearServicio().filtrar({ ordenarPor: 'servicios', orden: 'asc' });
    const nombres = [...new Set(resultado.map((p) => p.servicios))];
    expect(nombres).toEqual(['Cerrajería', 'Gasista', 'Instalación de Pisos', 'Jardinería', 'Plomería']);
    // dentro de Plomería: 5, 4.5, 3
    expect(ids(resultado.filter((p) => p.servicios === 'Plomería'))).toEqual(['p3', 'p1', 'p2']);
  });

  it('servicios: desc invierte el orden alfabético', () => {
    const resultado = crearServicio().filtrar({ ordenarPor: 'servicios', orden: 'desc' });
    expect(resultado[0].servicios).toBe('Plomería');
  });

  it('cercanía: menor distancia primero y los que no tienen dato al final', () => {
    const resultado = crearServicio().filtrar({ ordenarPor: 'cercania', orden: 'asc' });
    expect(ids(resultado.slice(0, 4))).toEqual(['p6', 'p4', 'p1', 'p2']);
    expect(ids(resultado.slice(4)).sort()).toEqual(['p3', 'p5', 'p7']);
  });

  it('cercanía desc: mayor distancia primero y los sin dato siguen al final', () => {
    const resultado = crearServicio().filtrar({ ordenarPor: 'cercania', orden: 'desc' });
    expect(ids(resultado.slice(0, 4))).toEqual(['p2', 'p1', 'p4', 'p6']);
    expect(resultado.slice(4).every((p) => p.distanciaKm === undefined)).toBe(true);
  });
});

describe('ContextoOrdenamiento (patrón Strategy)', () => {
  it('sin estrategia devuelve la misma lista', () => {
    expect(new ContextoOrdenamiento().ejecutar(PRESTADORES)).toBe(PRESTADORES);
  });

  it('usa la estrategia configurada y permite cambiarla en tiempo de ejecución', () => {
    const contexto = new ContextoOrdenamiento(new OrdenarPorPrecio());
    const porPrecio = contexto.ejecutar(PRESTADORES, 'asc');
    expect(porPrecio[0].id).toBe('p6');

    contexto.establecerEstrategia(new OrdenarPorCalificacion());
    expect(contexto.ejecutar(PRESTADORES, 'desc')[0].id).toBe('p3');

    contexto.establecerEstrategia(new OrdenarPorServicios());
    expect(contexto.ejecutar(PRESTADORES, 'asc')[0].servicios).toBe('Cerrajería');

    contexto.establecerEstrategia(new OrdenarPorCercania());
    expect(contexto.ejecutar(PRESTADORES, 'asc')[0].id).toBe('p6');
  });
});
