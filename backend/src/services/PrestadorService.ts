import { randomUUID } from 'node:crypto';
import { Prestador } from '../models/Prestador';
import {
  ContextoOrdenamiento,
  OrdenarPorCalificacion,
  OrdenarPorServicios,
  OrdenarPorPrecio,
  OrdenarPorCercania,
  IEstrategiaOrdenamiento
} from '../strategies/EstrategiaOrdenamiento';

export type CrearPrestadorDto = Omit<Prestador, "id">;
export type ActualizarPrestadorDto = Partial<Omit<Prestador, "id">>;

// Filtro ampliado con las opciones de ordenamiento
export interface FiltroPrestadores {
    servicios?: string;
    calificacionMinima?: number;
    calificacionMaxima?: number;
    ordenarPor?: "calificacion" | "servicios" | "precio" | "cercania";
    orden?: "asc" | "desc";
}

const normalizar = (texto: string): string =>
    texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

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

    // Método filtrar utilizando el Patrón Strategy
    filtrar(filtro: FiltroPrestadores = {}): Prestador[] {
        const {
            servicios,
            calificacionMinima,
            calificacionMaxima,
            ordenarPor,
            orden,
        } = filtro;

        // 1. Filtrado de datos
        const resultadoFiltrado = this.listar().filter((p) => {
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

        // 2. Mapa de estrategias de ordenamiento (OCP)
        const mapaEstrategias: Record<string, IEstrategiaOrdenamiento> = {
            calificacion: new OrdenarPorCalificacion(),
            servicios: new OrdenarPorServicios(),
            precio: new OrdenarPorPrecio(),
            cercania: new OrdenarPorCercania(),
        };

        const contexto = new ContextoOrdenamiento();

        if (ordenarPor && mapaEstrategias[ordenarPor]) {
            contexto.establecerEstrategia(mapaEstrategias[ordenarPor]);
        }

        // 3. Ejecutar y retornar resultado ordenado
        return contexto.ejecutar(resultadoFiltrado, orden);
    }

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