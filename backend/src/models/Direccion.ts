// Modelo para representar una dirección
// Por el momento solo se consideran direcciones de Bahía Blanca
// En un futuro se pueden añadir otras variables para otras ciudades

export interface Direccion {
    calle: string;
    numero: number;
    piso?: number;  // Opcional en caso de ser un edificio
    departamento?: string;
}