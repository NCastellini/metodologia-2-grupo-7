// Modelo que representa a los pedidos de visita
import { Cliente } from './Cliente';
import { Prestador } from './Prestador';

// Lista de posibles estados de una visita
export enum EstadoVisita {
    pendiente = 'PENDIENTE',
    confirmado = 'CONFIRMADO',
    cancelado = 'CANCELADO',
    completado = 'COMPLETADO',
}

// Vincula al prestador del servicio con el cliente y le asigna fecha y hora a la visita
export interface Visita {
    id: string;
    prestadorId: Prestador ['id']; // Utilizo solo la id de el prestador y del cliente para vincularlos
    clienteId: Cliente ['id'];
    fecha: string; // Fecha en formato AAAA/MM/DD
    hora: string; // Hora en formato HH:MM
    estado: EstadoVisita;
    notas?: string; // Posibles notas que el cliente le puede dar al prestador
}

// Variante para hacer llamadas más rápidas
export interface VisitaDetallada extends Omit<Visita, "clienteId" | "prestadorId"> {
    cliente: Cliente;
    prestador: Prestador;
}