// Todos los imports necesarios
import { randomUUID } from 'crypto';
import { EstadoVisita, Visita, VisitaDetallada } from '../models/Visita';
import { ClienteService } from './ClienteService';
import { PrestadorService } from './PrestadorService';

export type CrearVisitaDto = Omit<Visita, "id" | "estado"> & {
    estado?: EstadoVisita;
};
export type ActualizarVisitaDto = Partial<Omit<Visita, "id">>;

export interface FiltroVisitas {
    clienteId?: string;
    prestadorId?: string;
    fecha?: string;
    estado?: EstadoVisita;
}

// Estandar para la fecha y la hora
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export class VisitaService {
    private Visitas = new Map<string, Visita>();

    constructor(
        private readonly clienteService: ClienteService,
        private readonly prestadorService: PrestadorService
    ) {}

    crear(datos: CrearVisitaDto): Visita {
        this.validarReferencias(datos.clienteId, datos.prestadorId);
        this.validarFechaYHora(datos.fecha, datos.hora);
        this.validarDisponibilidad(
            datos.prestadorId,
            datos.fecha,
            datos.hora
    );

    const Visita: Visita = {
        id: randomUUID(),
        estado: EstadoVisita.pendiente,
        ...datos,
    };
        this.Visitas.set(Visita.id, Visita);
        return Visita;
    }

    obtenerPorId(id: string): Visita {
        const Visita = this.Visitas.get(id);
        if (!Visita) {
        throw new Error(`Visita con id ${id} no encontrado`);
        }
        return Visita;
    }

    // Devuelve el Visita con los objetos completos de cliente y prestador
    obtenerDetallado(id: string): VisitaDetallada {
        const { clienteId, prestadorId, ...resto } = this.obtenerPorId(id);
        return {
        ...resto,
        cliente: this.clienteService.obtenerPorId(clienteId),
        prestador: this.prestadorService.obtenerPorId(prestadorId),
        };
    }

    listar(filtro: FiltroVisitas = {}): Visita[] {
        return Array.from(this.Visitas.values())
        .filter(
            (t) =>
            (!filtro.clienteId || t.clienteId === filtro.clienteId) &&
            (!filtro.prestadorId || t.prestadorId === filtro.prestadorId) &&
            (!filtro.fecha || t.fecha === filtro.fecha) &&
            (!filtro.estado || t.estado === filtro.estado)
        )
        .sort(
            (a, b) =>
            a.fecha.localeCompare(b.fecha) ||
            a.hora.localeCompare(b.hora)
        );
    }

    actualizar(id: string, cambios: ActualizarVisitaDto): Visita {
        const existente = this.obtenerPorId(id);
        const actualizado: Visita = { ...existente, ...cambios, id };

        this.validarReferencias(actualizado.clienteId, actualizado.prestadorId);
        this.validarFechaYHora(
        actualizado.fecha,
        actualizado.hora
        );
        if (actualizado.estado !== EstadoVisita.cancelado) {
        this.validarDisponibilidad(
            actualizado.prestadorId,
            actualizado.fecha,
            actualizado.hora,
            id
        );
        }

        this.Visitas.set(id, actualizado);
        return actualizado;
    }

    eliminar(id: string): void {
        if (!this.Visitas.delete(id)) {
        throw new Error(`Visita con id ${id} no encontrado`);
        }
    }

    private validarReferencias(clienteId: string, prestadorId: string): void {
        // Lanzan error si no existen
        this.clienteService.obtenerPorId(clienteId);
    this.prestadorService.obtenerPorId(prestadorId);
    }

    private validarFechaYHora(
        fecha: string,
        hora: string,
    ): void {
        if (!FORMATO_FECHA.test(fecha) || Number.isNaN(Date.parse(fecha))) {
        throw new Error("La fecha debe tener formato YYYY-MM-DD y ser válida");
        }
        if (!FORMATO_HORA.test(hora)) {
        throw new Error("La hora deben tener formato HH:MM (24 hs)");
        }
    }

    // Evita que un prestador tenga dos visitas activos superpuestos
    private validarDisponibilidad(
        prestadorId: string,
        fecha: string,
        hora: string,
        excluirId?: string
    ): void {
        const hayConflicto = Array.from(this.Visitas.values()).some(
        (t) =>
            t.id !== excluirId &&
            t.prestadorId === prestadorId &&
            t.fecha === fecha &&
            t.estado !== EstadoVisita.cancelado &&
            t.hora
        );
        if (hayConflicto) {
        throw new Error(
            "El prestador ya tiene un Visita que se superpone en ese horario"
        );
        }
    }
}