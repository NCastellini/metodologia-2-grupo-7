// Modelo que representa a los prestadores de servicios

export interface Prestador {
    id: string;
    nombre: string;
    apellido: string;
    servicios: string;
    calificacion: number; //Calificación de 0 a 5 estrellas
    telefono: number;
    email: string;
}

