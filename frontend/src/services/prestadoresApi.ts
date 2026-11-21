import { API_URL } from '../config'
import type { FiltroPrestadores, Prestador } from '../types/prestador'

// Consulta GET /api/prestadores. El filtrado y el ordenamiento
// los resuelve el backend (PrestadorService.filtrar + Strategy).
export async function listarPrestadores(
  filtro: Partial<FiltroPrestadores> = {},
  signal?: AbortSignal,
): Promise<Prestador[]> {
  const params = new URLSearchParams()
  if (filtro.servicios) params.set('servicios', filtro.servicios)
  if (filtro.ordenarPor) {
    params.set('ordenarPor', filtro.ordenarPor)
    if (filtro.orden) params.set('orden', filtro.orden)
  }

  const query = params.toString()
  const url = `${API_URL}/api/prestadores${query ? `?${query}` : ''}`

  let respuesta: Response
  try {
    respuesta = await fetch(url, { signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error(`No se pudo conectar con el backend (${API_URL}). ¿Está en ejecución?`, {
      cause: error,
    })
  }

  if (!respuesta.ok) {
    // El backend responde { mensaje } en los errores 400 y 404.
    const cuerpo = await respuesta.json().catch(() => null)
    throw new Error(cuerpo?.mensaje ?? `Error ${respuesta.status} al consultar prestadores`)
  }

  return respuesta.json()
}
