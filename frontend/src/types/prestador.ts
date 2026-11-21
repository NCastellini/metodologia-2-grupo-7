// Misma forma que el modelo Prestador del backend.
export interface Prestador {
  id: string
  nombre: string
  apellido: string
  servicios: string
  calificacion: number
  telefono: number
  email: string
  precio?: number
  distanciaKm?: number
}

export type CriterioOrden = 'calificacion' | 'servicios' | 'precio' | 'cercania'
export type Orden = 'asc' | 'desc'

export interface FiltroPrestadores {
  servicios: string // '' = todos
  ordenarPor: CriterioOrden | '' // '' = sin ordenar
  orden: Orden
}
