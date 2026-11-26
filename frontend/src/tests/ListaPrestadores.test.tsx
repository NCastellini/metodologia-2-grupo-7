import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ListaPrestadores } from '../components/ListaPrestadores'
import type { Prestador } from '../types/prestador'

const base: Prestador = {
  id: '1', nombre: 'Ana', apellido: 'Pérez', servicios: 'Plomería',
  calificacion: 4.5, telefono: 1100000001, email: 'ana@mail.com',
}

describe('ListaPrestadores', () => {
  it('muestra "Sin precio" para un prestador sin precio', () => {
    render(<ListaPrestadores prestadores={[base]} />)
    expect(screen.getByText('Sin precio')).toBeInTheDocument()
  })

  it('muestra el precio formateado cuando existe', () => {
    render(<ListaPrestadores prestadores={[{ ...base, precio: 15000 }]} />)
    expect(screen.getByText(/\$\s*15\.000/)).toBeInTheDocument()
    expect(screen.queryByText('Sin precio')).not.toBeInTheDocument()
  })

  it('un precio 0 se muestra como precio, no como "Sin precio"', () => {
    render(<ListaPrestadores prestadores={[{ ...base, precio: 0 }]} />)
    expect(screen.getByText(/\$\s*0/)).toBeInTheDocument()
    expect(screen.queryByText('Sin precio')).not.toBeInTheDocument()
  })

  it('muestra la calificación con un decimal', () => {
    render(<ListaPrestadores prestadores={[{ ...base, calificacion: 4 }]} />)
    expect(screen.getByText(/4\.0 \/ 5/)).toBeInTheDocument()
  })

  it('muestra "Distancia sin dato" si falta la distancia', () => {
    render(<ListaPrestadores prestadores={[base]} />)
    expect(screen.getByText('Distancia sin dato')).toBeInTheDocument()
  })

  it('respeta el orden recibido (el orden lo define el backend)', () => {
    const lista = [
      { ...base, id: 'a', nombre: 'Primero' },
      { ...base, id: 'b', nombre: 'Segundo' },
      { ...base, id: 'c', nombre: 'Tercero' },
    ]
    render(<ListaPrestadores prestadores={lista} />)
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(titulos).toEqual(['Primero Pérez', 'Segundo Pérez', 'Tercero Pérez'])
  })

  it('renderiza una tarjeta por prestador y ninguna si la lista está vacía', () => {
    const { rerender } = render(<ListaPrestadores prestadores={[base, { ...base, id: '2' }]} />)
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2)
    rerender(<ListaPrestadores prestadores={[]} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
