import { useEffect, useState } from 'react'
import { FiltrosPrestadores } from './components/FiltrosPrestadores'
import { ListaPrestadores } from './components/ListaPrestadores'
import { listarPrestadores } from './services/prestadoresApi'
import type { FiltroPrestadores, Prestador } from './types/prestador'
import './App.css'

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'listo'; prestadores: Prestador[] }

const FILTRO_INICIAL: FiltroPrestadores = { servicios: '', ordenarPor: '', orden: 'asc' }

function App() {
  const [filtro, setFiltro] = useState<FiltroPrestadores>(FILTRO_INICIAL)
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' })
  const [servicios, setServicios] = useState<string[]>([])
  const [reintento, setReintento] = useState(0)

  // Opciones del filtro: los servicios distintos que existen en el backend.
  useEffect(() => {
    const controlador = new AbortController()
    listarPrestadores({}, controlador.signal)
      .then((todos) => {
        const unicos = [...new Set(todos.map((p) => p.servicios))]
        setServicios(unicos.sort((a, b) => a.localeCompare(b, 'es')))
      })
      .catch(() => {
        // Si falla, el error ya se muestra en la consulta principal.
      })
    return () => controlador.abort()
  }, [reintento])

  // Consulta principal: se repite cada vez que cambia el filtro.
  useEffect(() => {
    const controlador = new AbortController()
    listarPrestadores(filtro, controlador.signal)
      .then((prestadores) => setEstado({ tipo: 'listo', prestadores }))
      .catch((error: Error) => {
        if (error.name === 'AbortError') return // consulta reemplazada por otra más nueva
        setEstado({ tipo: 'error', mensaje: error.message })
      })
    return () => controlador.abort()
  }, [filtro, reintento])

  function cambiarFiltro(nuevo: FiltroPrestadores) {
    setFiltro(nuevo)
    setEstado({ tipo: 'cargando' })
  }

  function reintentar() {
    setReintento((n) => n + 1)
    setEstado({ tipo: 'cargando' })
  }

  return (
    <main className="contenedor">
      <header>
        <h1>Prestadores de servicios para el hogar</h1>
        <p>Consultá prestadores, filtralos por servicio y ordenalos.</p>
      </header>

      <FiltrosPrestadores
        filtro={filtro}
        serviciosDisponibles={servicios}
        onCambiar={cambiarFiltro}
      />

      {estado.tipo === 'cargando' && <p className="mensaje">Cargando prestadores…</p>}

      {estado.tipo === 'error' && (
        <div className="mensaje error" role="alert">
          <p>{estado.mensaje}</p>
          <button type="button" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      )}

      {estado.tipo === 'listo' && estado.prestadores.length === 0 && (
        <p className="mensaje">No se encontraron prestadores con ese filtro.</p>
      )}

      {estado.tipo === 'listo' && estado.prestadores.length > 0 && (
        <>
          <p className="resultados">{estado.prestadores.length} prestadores encontrados</p>
          <ListaPrestadores prestadores={estado.prestadores} />
        </>
      )}
    </main>
  )
}

export default App
