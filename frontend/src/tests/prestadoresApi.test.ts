import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { listarPrestadores } from '../services/prestadoresApi'
import { API_URL } from '../config'

const respuestaJson = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } })

describe('prestadoresApi.listarPrestadores — consulta que arma el frontend', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockImplementation(async () => respuestaJson([]))
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  const urlLlamada = () => new URL(fetchMock.mock.calls[0][0] as string)

  it('sin filtros consulta /api/prestadores sin query string', async () => {
    await listarPrestadores({})
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/api/prestadores`)
  })

  it('"Todos" (servicio vacío) no envía el parámetro servicios', async () => {
    await listarPrestadores({ servicios: '', ordenarPor: '', orden: 'asc' })
    expect(urlLlamada().search).toBe('')
  })

  it('envía el servicio elegido, codificando tildes y espacios', async () => {
    await listarPrestadores({ servicios: 'Instalación de Pisos' })
    expect(urlLlamada().searchParams.get('servicios')).toBe('Instalación de Pisos')
    expect(fetchMock.mock.calls[0][0]).toContain('servicios=Instalaci%C3%B3n+de+Pisos')
  })

  it.each(['calificacion', 'precio', 'cercania', 'servicios'] as const)(
    'envía ordenarPor=%s junto con el sentido del orden',
    async (criterio) => {
      await listarPrestadores({ ordenarPor: criterio, orden: 'desc' })
      expect(urlLlamada().searchParams.get('ordenarPor')).toBe(criterio)
      expect(urlLlamada().searchParams.get('orden')).toBe('desc')
    },
  )

  it('no envía "orden" si no hay criterio de ordenamiento', async () => {
    await listarPrestadores({ ordenarPor: '', orden: 'desc' })
    expect(urlLlamada().searchParams.has('orden')).toBe(false)
  })

  it('combina servicio y ordenamiento en una sola consulta', async () => {
    await listarPrestadores({ servicios: 'Plomería', ordenarPor: 'precio', orden: 'asc' })
    const p = urlLlamada().searchParams
    expect([p.get('servicios'), p.get('ordenarPor'), p.get('orden')]).toEqual(['Plomería', 'precio', 'asc'])
  })

  it('devuelve la lista del backend, y una lista vacía si no hay resultados', async () => {
    const lista = [{ id: '1', nombre: 'A', apellido: 'B', servicios: 'Gasista', calificacion: 4, telefono: 1, email: 'a@b.c' }]
    fetchMock.mockImplementationOnce(async () => respuestaJson(lista))
    expect(await listarPrestadores({})).toEqual(lista)

    fetchMock.mockImplementationOnce(async () => respuestaJson([]))
    expect(await listarPrestadores({ servicios: 'Astronauta' })).toEqual([])
  })

  it('muestra el mensaje del backend cuando responde un error 400', async () => {
    fetchMock.mockImplementationOnce(async () => respuestaJson({ mensaje: 'orden debe ser asc o desc' }, 400))
    await expect(listarPrestadores({})).rejects.toThrow('orden debe ser asc o desc')
  })

  it('usa un mensaje genérico si el error no trae cuerpo JSON', async () => {
    fetchMock.mockImplementationOnce(async () => new Response('boom', { status: 500 }))
    await expect(listarPrestadores({})).rejects.toThrow('Error 500 al consultar prestadores')
  })

  it('avisa que el backend no está disponible si falla la red', async () => {
    fetchMock.mockImplementationOnce(async () => { throw new TypeError('fetch failed') })
    await expect(listarPrestadores({})).rejects.toThrow(/No se pudo conectar con el backend/)
  })
})
