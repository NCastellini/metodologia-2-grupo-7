import { Prestador } from '../models/Prestador';
import { PrestadorService } from '../services/PrestadorService';

// Dataset controlado para las pruebas. No se usa prestadores.json porque ninguno de
// sus 50 registros tiene precio ni distancia: no permitiría probar el ordenamiento.
export const PRESTADORES: Prestador[] = [
  // Plomería: 3 prestadores con calificación y precio distintos
  { id: 'p1', nombre: 'Ana', apellido: 'Pérez', servicios: 'Plomería', calificacion: 4.5, telefono: 1100000001, email: 'p1@mail.com', precio: 15000, distanciaKm: 3 },
  { id: 'p2', nombre: 'Bruno', apellido: 'Álvarez', servicios: 'Plomería', calificacion: 3, telefono: 1100000002, email: 'p2@mail.com', precio: 8000, distanciaKm: 10 },
  // Sin precio ni distancia: caso borde de datos opcionales
  { id: 'p3', nombre: 'Carla', apellido: 'Gómez', servicios: 'Plomería', calificacion: 5, telefono: 1100000003, email: 'p3@mail.com' },
  // Servicio con tilde distinta y varias palabras
  { id: 'p4', nombre: 'Diego', apellido: 'Rossi', servicios: 'Instalación de Pisos', calificacion: 4, telefono: 1100000004, email: 'p4@mail.com', precio: 12000, distanciaKm: 1.5 },
  // Misma calificación que p4 (4) para probar el desempate por apellido
  { id: 'p5', nombre: 'Eva', apellido: 'Benítez', servicios: 'Jardinería', calificacion: 4, telefono: 1100000005, email: 'p5@mail.com' },
  // Precio 0: es un dato válido, distinto de "sin precio"
  { id: 'p6', nombre: 'Fabio', apellido: 'Luna', servicios: 'Cerrajería', calificacion: 2, telefono: 1100000006, email: 'p6@mail.com', precio: 0, distanciaKm: 0 },
  // Calificación mínima del rango
  { id: 'p7', nombre: 'Gina', apellido: 'Sosa', servicios: 'Gasista', calificacion: 0, telefono: 1100000007, email: 'p7@mail.com', precio: 20000 },
];

export function crearServicio(prestadores: Prestador[] = PRESTADORES): PrestadorService {
  const servicio = new PrestadorService();
  for (const p of prestadores) servicio.cargarInicial({ ...p });
  return servicio;
}

export const ids = (lista: Prestador[]): string[] => lista.map((p) => p.id);
