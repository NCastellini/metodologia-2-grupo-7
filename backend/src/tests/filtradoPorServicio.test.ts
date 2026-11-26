import { describe, it, expect } from 'vitest';
import { crearServicio, ids } from './fixtures';
import { PrestadorService } from '../services/PrestadorService';

describe('PrestadorService.filtrar — filtrado por servicio', () => {
  it('devuelve solo los prestadores del servicio pedido', () => {
    const resultado = crearServicio().filtrar({ servicios: 'Plomería' });

    expect(ids(resultado)).toEqual(['p1', 'p2', 'p3']);
    expect(resultado.every((p) => p.servicios === 'Plomería')).toBe(true);
  });

  it('devuelve un único prestador cuando el servicio tiene uno solo', () => {
    expect(ids(crearServicio().filtrar({ servicios: 'Cerrajería' }))).toEqual(['p6']);
  });

  it('sin filtro devuelve todos los prestadores (opción "Todos" del frontend)', () => {
    expect(crearServicio().filtrar()).toHaveLength(7);
    expect(crearServicio().filtrar({})).toHaveLength(7);
  });

  it('un servicio vacío se trata como "sin filtro"', () => {
    // El frontend usa '' para "Todos"; no debe vaciar la lista.
    expect(crearServicio().filtrar({ servicios: '' })).toHaveLength(7);
  });

  it('ignora espacios sobrantes alrededor del servicio', () => {
    expect(ids(crearServicio().filtrar({ servicios: '  Plomería  ' }))).toEqual(['p1', 'p2', 'p3']);
  });

  it('combina servicio con calificación mínima', () => {
    const resultado = crearServicio().filtrar({ servicios: 'Plomería', calificacionMinima: 4 });
    expect(ids(resultado)).toEqual(['p1', 'p3']);
  });

  it('combina servicio con calificación máxima', () => {
    const resultado = crearServicio().filtrar({ servicios: 'Plomería', calificacionMaxima: 4.5 });
    expect(ids(resultado)).toEqual(['p1', 'p2']);
  });

  it('los límites de calificación son inclusivos', () => {
    const resultado = crearServicio().filtrar({ calificacionMinima: 4, calificacionMaxima: 4 });
    expect(ids(resultado)).toEqual(['p4', 'p5']);
  });

  it('el servicio debe coincidir completo: un fragmento no alcanza', () => {
    // Comportamiento actual (coincidencia exacta normalizada). El frontend usa un
    // <select> con los nombres completos, por eso no necesita búsqueda parcial.
    expect(crearServicio().filtrar({ servicios: 'Plom' })).toEqual([]);
    expect(crearServicio().filtrar({ servicios: 'Instalación' })).toEqual([]);
  });

  it('no modifica los prestadores almacenados', () => {
    const servicio = crearServicio();
    servicio.filtrar({ servicios: 'Plomería', ordenarPor: 'precio', orden: 'desc' });
    expect(ids(servicio.listar())).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']);
  });
});

describe('PrestadorService.filtrar — mayúsculas y tildes', () => {
  const casos: [string, string, string[]][] = [
    ['minúsculas sin tilde', 'plomeria', ['p1', 'p2', 'p3']],
    ['mayúsculas con tilde', 'PLOMERÍA', ['p1', 'p2', 'p3']],
    ['mayúsculas sin tilde', 'PLOMERIA', ['p1', 'p2', 'p3']],
    ['capitalización mezclada', 'pLoMeRíA', ['p1', 'p2', 'p3']],
    ['tilde en el dato pero no en la búsqueda (Jardinería)', 'jardineria', ['p5']],
    ['servicio de varias palabras sin tildes', 'instalacion de pisos', ['p4']],
    ['servicio de varias palabras en mayúsculas', 'INSTALACIÓN DE PISOS', ['p4']],
    ['tilde en la búsqueda pero no en el dato (Gasista)', 'Gásista', ['p7']],
  ];

  it.each(casos)('%s → "%s"', (_descripcion, busqueda, esperados) => {
    expect(ids(crearServicio().filtrar({ servicios: busqueda }))).toEqual(esperados);
  });

  it('acepta la tilde escrita como carácter + acento combinado (Unicode NFD)', () => {
    // "í" puede llegar como U+00ED (compuesta) o "i" + U+0301 (descompuesta),
    // según el teclado o el sistema operativo.
    const descompuesta = 'Plomería';
    expect(descompuesta).not.toBe('Plomería');
    expect(ids(crearServicio().filtrar({ servicios: descompuesta }))).toEqual(['p1', 'p2', 'p3']);
  });

  it('también normaliza el dato almacenado, no solo la búsqueda', () => {
    const servicio = new PrestadorService();
    servicio.cargarInicial({
      id: 'x1', nombre: 'Test', apellido: 'Uno', servicios: 'ALBAÑILERÍA',
      calificacion: 3, telefono: 1, email: 'x1@mail.com',
    });
    expect(ids(servicio.filtrar({ servicios: 'albañileria' }))).toEqual(['x1']);
  });

  it('la tilde no vuelve equivalentes a servicios distintos', () => {
    // Quitar tildes no debe provocar falsos positivos entre palabras diferentes.
    expect(crearServicio().filtrar({ servicios: 'Plomeros' })).toEqual([]);
  });
});

describe('PrestadorService.filtrar — búsqueda sin resultados', () => {
  it('devuelve un arreglo vacío (no lanza error) si el servicio no existe', () => {
    const resultado = crearServicio().filtrar({ servicios: 'Astronauta' });
    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado).toEqual([]);
  });

  it('devuelve vacío si ningún prestador alcanza la calificación mínima', () => {
    expect(crearServicio().filtrar({ calificacionMinima: 5.1 })).toEqual([]);
  });

  it('devuelve vacío si el servicio existe pero la calificación lo excluye', () => {
    expect(crearServicio().filtrar({ servicios: 'Cerrajería', calificacionMinima: 4 })).toEqual([]);
  });

  it('devuelve vacío si el rango de calificación es contradictorio (mín > máx)', () => {
    expect(crearServicio().filtrar({ calificacionMinima: 4, calificacionMaxima: 2 })).toEqual([]);
  });

  it('ordenar un resultado vacío no falla, con cualquier criterio', () => {
    const servicio = crearServicio();
    for (const ordenarPor of ['calificacion', 'servicios', 'precio', 'cercania'] as const) {
      expect(servicio.filtrar({ servicios: 'Astronauta', ordenarPor, orden: 'asc' })).toEqual([]);
    }
  });

  it('un servicio sin prestadores cargados devuelve vacío', () => {
    expect(new PrestadorService().filtrar({ servicios: 'Plomería' })).toEqual([]);
    expect(new PrestadorService().filtrar()).toEqual([]);
  });
});
