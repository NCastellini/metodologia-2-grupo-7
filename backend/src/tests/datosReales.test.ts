import { describe, it, expect } from 'vitest';
import prestadoresIniciales from '../data/prestadores.json';
import { Prestador } from '../models/Prestador';
import { PrestadorService } from '../services/PrestadorService';

// Prueba de integración con los 50 prestadores reales que carga serviceContainer.ts.
function cargarReales(): PrestadorService {
  const servicio = new PrestadorService();
  for (const p of prestadoresIniciales as Prestador[]) servicio.cargarInicial(p);
  return servicio;
}

describe('Datos reales (prestadores.json)', () => {
  it('cada servicio del select del frontend devuelve al menos un prestador', () => {
    const servicio = cargarReales();
    const servicios = [...new Set(servicio.listar().map((p) => p.servicios))];
    expect(servicios.length).toBeGreaterThan(1);
    for (const s of servicios) {
      const resultado = servicio.filtrar({ servicios: s });
      expect(resultado.length).toBeGreaterThan(0);
      expect(resultado.every((p) => p.servicios === s)).toBe(true);
    }
  });

  it('los filtros por servicio suman exactamente el total (nadie queda afuera ni repetido)', () => {
    const servicio = cargarReales();
    const servicios = [...new Set(servicio.listar().map((p) => p.servicios))];
    const suma = servicios.reduce((acc, s) => acc + servicio.filtrar({ servicios: s }).length, 0);
    expect(suma).toBe(servicio.listar().length);
  });

  it('encuentra "Plomería" escrito sin tilde y en mayúsculas', () => {
    const servicio = cargarReales();
    const esperado = servicio.filtrar({ servicios: 'Plomería' });
    expect(esperado.length).toBeGreaterThan(0);
    expect(servicio.filtrar({ servicios: 'PLOMERIA' })).toEqual(esperado);
  });

  it('ordenar por calificación desc deja la lista ordenada', () => {
    const cals = cargarReales().filtrar({ ordenarPor: 'calificacion', orden: 'desc' }).map((p) => p.calificacion);
    expect(cals).toEqual([...cals].sort((a, b) => b - a));
  });

  it('ordenar por precio no rompe aunque hoy ningún registro tenga precio', () => {
    const servicio = cargarReales();
    const resultado = servicio.filtrar({ ordenarPor: 'precio', orden: 'asc' });
    expect(resultado).toHaveLength(servicio.listar().length);
    expect(resultado.every((p) => p.precio === undefined)).toBe(true);
  });
});
