import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import type { Prestador } from '../types/prestador'

const P = (id: string, servicios: string, calificacion: number, extra: Partial<Prestador> = {}): Prestador => ({
  id, nombre: `Nombre${id}`, apellido: 'Apellido', servicios, calificacion,
  telefono: 1100000000, email: `${id}@mail.com`, ...extra,
})

const TODOS = [P('1', 'Plomería', 3), P('2', 'Gasista', 5), P('3', 'Plomería', 4)]

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } })

// Simula el backend: responde según la query que arma el frontend.
function backendFalso(url: string): Response {
  const params = new URL(url).searchParams
  const servicio = params.get('servicios')
  let lista = servicio ? TODOS.filter((p) => p.servicios === servicio) : [...TODOS]
  if (params.get('ordenarPor') === 'calificacion') {
    const f = params.get('orden') === 'asc' ? 1 : -1
    lista = lista.sort((a, b) => f * (a.calificacion - b.calificacion))
  }
  if (servicio === 'SinResultados') lista = []
  return json(lista)
}

describe('App — búsqueda y ordenamiento de prestadores', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockImplementation(async (url: string) => backendFalso(url))
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  const nombresMostrados = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)

  it('al abrir lista todos los prestadores y arma el select con servicios únicos ordenados', async () => {
    render(<App />)
    expect(await screen.findByText('3 prestadores encontrados')).toBeInTheDocument()

    const select = screen.getByLabelText('Servicio')
    const opciones = within(select).getAllByRole('option').map((o) => o.textContent)
    expect(opciones).toEqual(['Todos', 'Gasista', 'Plomería'])
  })

  it('filtrar por servicio muestra solo los prestadores de ese servicio', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('3 prestadores encontrados')

    await user.selectOptions(screen.getByLabelText('Servicio'), 'Plomería')

    expect(await screen.findByText('2 prestadores encontrados')).toBeInTheDocument()
    expect(nombresMostrados()).toEqual(['Nombre1 Apellido', 'Nombre3 Apellido'])
  })

  it('volver a "Todos" restablece la lista completa', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('3 prestadores encontrados')
    await user.selectOptions(screen.getByLabelText('Servicio'), 'Gasista')
    await screen.findByText('1 prestadores encontrados')

    await user.selectOptions(screen.getByLabelText('Servicio'), '')
    expect(await screen.findByText('3 prestadores encontrados')).toBeInTheDocument()
  })

  it('ordenar por calificación descendente refleja el orden del backend', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('3 prestadores encontrados')

    await user.selectOptions(screen.getByLabelText('Ordenar por'), 'calificacion')
    await user.selectOptions(screen.getByLabelText('Orden'), 'desc')

    await waitFor(() => expect(nombresMostrados()).toEqual(['Nombre2 Apellido', 'Nombre3 Apellido', 'Nombre1 Apellido']))
    const ultima = new URL(fetchMock.mock.calls.at(-1)![0] as string).searchParams
    expect([ultima.get('ordenarPor'), ultima.get('orden')]).toEqual(['calificacion', 'desc'])
  })

  it('el selector "Orden" está deshabilitado mientras no haya criterio', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('3 prestadores encontrados')
    expect(screen.getByLabelText('Orden')).toBeDisabled()

    await user.selectOptions(screen.getByLabelText('Ordenar por'), 'precio')
    expect(screen.getByLabelText('Orden')).toBeEnabled()
  })

  it('muestra "Sin precio" para los prestadores que no lo tienen', async () => {
    render(<App />)
    await screen.findByText('3 prestadores encontrados')
    expect(screen.getAllByText('Sin precio')).toHaveLength(3)
  })

  it('si la búsqueda no devuelve resultados muestra un mensaje claro', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      new URL(url).searchParams.get('servicios') ? json([]) : json(TODOS))
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('3 prestadores encontrados')

    await user.selectOptions(screen.getByLabelText('Servicio'), 'Plomería')

    expect(await screen.findByText('No se encontraron prestadores con ese filtro.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.queryByText(/prestadores encontrados/)).not.toBeInTheDocument()
  })

  it('muestra un error con botón "Reintentar" si el backend falla, y se recupera', async () => {
    fetchMock.mockImplementation(async () => json({ mensaje: 'Falla del servidor' }, 500))
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Falla del servidor')

    fetchMock.mockImplementation(async (url: string) => backendFalso(url))
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('3 prestadores encontrados')).toBeInTheDocument()
  })
})
