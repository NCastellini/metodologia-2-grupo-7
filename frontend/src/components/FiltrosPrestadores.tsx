import type { CriterioOrden, FiltroPrestadores, Orden } from '../types/prestador'

interface Props {
  filtro: FiltroPrestadores
  serviciosDisponibles: string[]
  onCambiar: (filtro: FiltroPrestadores) => void
}

const CRITERIOS: { valor: CriterioOrden | ''; etiqueta: string }[] = [
  { valor: '', etiqueta: 'Sin ordenar' },
  { valor: 'calificacion', etiqueta: 'Calificación' },
  { valor: 'precio', etiqueta: 'Precio' },
  { valor: 'cercania', etiqueta: 'Cercanía' },
  { valor: 'servicios', etiqueta: 'Servicio (A-Z)' },
]

export function FiltrosPrestadores({ filtro, serviciosDisponibles, onCambiar }: Props) {
  return (
    <form className="filtros" onSubmit={(e) => e.preventDefault()}>
      <label>
        Servicio
        <select
          value={filtro.servicios}
          onChange={(e) => onCambiar({ ...filtro, servicios: e.target.value })}
        >
          <option value="">Todos</option>
          {serviciosDisponibles.map((servicio) => (
            <option key={servicio} value={servicio}>
              {servicio}
            </option>
          ))}
        </select>
      </label>

      <label>
        Ordenar por
        <select
          value={filtro.ordenarPor}
          onChange={(e) =>
            onCambiar({ ...filtro, ordenarPor: e.target.value as CriterioOrden | '' })
          }
        >
          {CRITERIOS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.etiqueta}
            </option>
          ))}
        </select>
      </label>

      <label>
        Orden
        <select
          value={filtro.orden}
          disabled={!filtro.ordenarPor}
          onChange={(e) => onCambiar({ ...filtro, orden: e.target.value as Orden })}
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </label>
    </form>
  )
}
