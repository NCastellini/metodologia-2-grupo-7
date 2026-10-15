// Modelo que representa a los clientes
// Importo la dirección 
import { Direccion } from './Direccion';

export interface Cliente {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    direccion: Direccion;
}

