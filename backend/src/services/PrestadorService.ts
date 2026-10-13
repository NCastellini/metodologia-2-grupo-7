import { randomUUID } from 'crypto';
import { Prestador } from '../models/Prestador';

export type CrearPrestadorDto = Omit<Prestador, "id">;
export type ActualizarPrestadorDto = Partial<Omit<Prestador, "id">>;

// Filtro para los prestadores
export interface FiltroPrestadores {
    // Coincidencia exacta de servicios
    servicios?: string;
    // Calificación mínima (inclusive)
    calificacionMinima?: number;
    // Calificación máxima (inclusive)
    calificacionMaxima?: number;
    // Campo por el cual ordenar. Si se omite, no se ordena
    ordenarPor?: "calificacion" | "servicios";
    // Dirección del orden. Por defecto "desc" para calificación y "asc" para servicios
    orden?: "asc" | "desc";
}

const normalizar = (texto: string): string =>
    texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

// CRUD básico para los prestadores
export class PrestadorService {
    private Prestadores = new Map<string, Prestador>();

    crear(datos: CrearPrestadorDto): Prestador {
        this.validarCalificacion(datos.calificacion);
    this.validarEmailUnico(datos.email);
        const Prestador: Prestador = { id: randomUUID(), ...datos };
        this.Prestadores.set(Prestador.id, Prestador);
    return Prestador;
    }

    obtenerPorId(id: string): Prestador {
        const Prestador = this.Prestadores.get(id);
        if (!Prestador) {
        throw new Error(`Prestador con id ${id} no encontrado`);
        }
        return Prestador;
    }

    listar(): Prestador[] {
        return Array.from(this.Prestadores.values());
    }

    actualizar(id: string, cambios: ActualizarPrestadorDto): Prestador {
        const existente = this.obtenerPorId(id);
        if (cambios.calificacion !== undefined) {
        this.validarCalificacion(cambios.calificacion);
        }
        if (cambios.email && cambios.email !== existente.email) {
        this.validarEmailUnico(cambios.email, id);
        }
        const actualizado: Prestador = { ...existente, ...cambios, id };
        this.Prestadores.set(id, actualizado);
        return actualizado;
    }

    eliminar(id: string): void {
        if (!this.Prestadores.delete(id)) {
        throw new Error(`Prestador con id ${id} no encontrado`);
        }
    }

    // Filtra y ordena Prestadores por calificación y/o servicios
    filtrar(filtro: FiltroPrestadores = {}): Prestador[] {
        const {
        servicios,
        calificacionMinima,
        calificacionMaxima,
        ordenarPor,
        orden,
        } = filtro;

        let resultado = this.listar().filter((p) => {
        if (servicios && normalizar(p.servicios) !== normalizar(servicios)) {
        return false;
        }
        if (calificacionMinima !== undefined && p.calificacion < calificacionMinima) {
            return false;
        }
        if (calificacionMaxima !== undefined && p.calificacion > calificacionMaxima) {
            return false;
        }
        return true;
        });

        if (ordenarPor === "calificacion") {
        const factor = (orden ?? "desc") === "asc" ? 1 : -1;
        resultado = resultado.sort(
            (a, b) =>
            factor * (a.calificacion - b.calificacion) ||
            a.apellido.localeCompare(b.apellido, "es")
        );
        } else if (ordenarPor === "servicios") {
        const factor = (orden ?? "asc") === "asc" ? 1 : -1;
        resultado = resultado.sort(
            (a, b) =>
            factor * a.servicios.localeCompare(b.servicios, "es") ||
            b.calificacion - a.calificacion
        );
    }

        return resultado;
    }

    // Validators para los campos que los necesitan
    private validarCalificacion(calificacion: number): void {
        if (Number.isNaN(calificacion) || calificacion < 0 || calificacion > 5) {
        throw new Error("La calificación debe estar entre 0 y 5");
        }
    }

    private validarEmailUnico(email: string, excluirId?: string): void {
        const duplicado = this.listar().some(
        (p) => p.id !== excluirId && p.email.toLowerCase() === email.toLowerCase()
        );
        if (duplicado) {
        throw new Error(`Ya existe un Prestador con el email ${email}`);
        }
    }
}