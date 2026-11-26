import { useEffect, useState } from 'react'
import { useMovablesStore } from '../movables-store'
import { playPaper } from '../sound'
import { useBookStore } from '../store'

export interface MovableControlsProps {
  className?: string
  /** Nombre accesible del grupo de controles. */
  label?: string
}

/**
 * Controles HTML accesibles para los movibles del spread abierto: un
 * deslizador por cada lengüeta o rueda y un botón por cada solapa. Así se
 * pueden manejar con el teclado o con un lector de pantalla.
 */
export function MovableControls({
  className = 'pliego-movables',
  label = 'Piezas móviles',
}: MovableControlsProps) {
  const current = useBookStore((state) => state.current)
  const entries = useMovablesStore((state) => state.entries).filter(
    (entry) => entry.spread === current - 1,
  )
  // Refresca los valores mostrados cuando la pieza se mueve con el ratón.
  const [, tick] = useState(0)
  useEffect(() => {
    if (entries.length === 0) return
    const timer = window.setInterval(() => tick((n) => n + 1), 250)
    return () => window.clearInterval(timer)
  }, [entries.length])

  if (entries.length === 0) return null
  return (
    <div className={className} role="group" aria-label={label}>
      {entries.map((entry) =>
        entry.kind === 'toggle' ? (
          <button
            key={entry.id}
            type="button"
            aria-pressed={entry.progress() > 0.5}
            onClick={() => {
              playPaper('flap')
              entry.toggle()
            }}
          >
            {entry.label}
          </button>
        ) : (
          <label key={entry.id}>
            {entry.label}
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(entry.progress() * 100)}
              onChange={(event) => entry.set(Number(event.target.value) / 100)}
            />
          </label>
        ),
      )}
    </div>
  )
}
