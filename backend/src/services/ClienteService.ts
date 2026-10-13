import { randomUUID } from 'crypto';
import { Cliente } from '../models/Cliente';

export type CrearClienteDto = Omit<Cliente, "id">;
export type ActualizarClienteDto = Partial<Omit<Cliente, "id">>;

export class ClienteService {
    // CRUD básico para los clientes
    private clientes = new Map<string, Cliente>();

    crear(datos: CrearClienteDto): Cliente {
        this.validarEmailUnico(datos.email);
        const cliente: Cliente = { id: randomUUID(), ...datos };
        this.clientes.set(cliente.id, cliente);
        return cliente;
    }

    obtenerPorId(id: string): Cliente {
        const cliente = this.clientes.get(id);
        if (!cliente) {
        throw new Error(`Cliente con id ${id} no encontrado`);
        }
        return cliente;
    }

    listar(): Cliente[] {
        return Array.from(this.clientes.values());
    }

    actualizar(id: string, cambios: ActualizarClienteDto): Cliente {
        const existente = this.obtenerPorId(id);
        if (cambios.email && cambios.email !== existente.email) {
        this.validarEmailUnico(cambios.email, id);
        }
        const actualizado: Cliente = { ...existente, ...cambios, id };
        this.clientes.set(id, actualizado);
        return actualizado;
    }

    eliminar(id: string): void {
        if (!this.clientes.delete(id)) {
        throw new Error(`Cliente con id ${id} no encontrado`);
        }
    }

    // Validator para el mail
    private validarEmailUnico(email: string, excluirId?: string): void {
        const duplicado = this.listar().some(
        (c) => c.id !== excluirId && c.email.toLowerCase() === email.toLowerCase()
        );
        if (duplicado) {
        throw new Error(`Ya existe un cliente con el email ${email}`);
        }
    }
}