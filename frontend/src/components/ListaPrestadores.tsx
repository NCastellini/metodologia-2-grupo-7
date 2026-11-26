import type { Prestador } from '../types/prestador'

interface Props {
  prestadores: Prestador[]
}

export function ListaPrestadores({ prestadores }: Props) {
  return (
    <ul className="lista">
      {prestadores.map((p) => (
        <li key={p.id} className="tarjeta">
          <h2>
            {p.nombre} {p.apellido}
          </h2>
          <p className="servicio">{p.servicios}</p>
          <p>⭐ {p.calificacion.toFixed(1)} / 5</p>
          <p>{p.precio !== undefined ? `$ ${p.precio.toLocaleString('es-AR')}` : 'Sin precio'}</p>
          <p>{p.distanciaKm !== undefined ? `${p.distanciaKm} km` : 'Distancia sin dato'}</p>
          <p className="contacto">
            {p.email} · {p.telefono}
          </p>
        </li>
      ))}
    </ul>
  )
}
