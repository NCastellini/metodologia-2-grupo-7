// Modelo que representa a los prestadores de servicios

export interface Prestador {
    id: string;
    nombre: string;
    apellido: string;
    servicios: string;
    calificacion: number; //Calificación de 0 a 5 estrellas
    telefono: number;
    email: string;
    //estos son opcionales porque puede que no todos los prestadores tengan precio o distancia asociada
    precio?: number;
    distanciaKm?: number;
}

