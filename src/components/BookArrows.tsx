import type { CSSProperties } from 'react'
import { useBook, useBookStore } from '../store'

export interface BookArrowsProps {
  className?: string
  style?: CSSProperties
  /** Textos accesibles de los botones (pásalos traducidos con `useT()`). */
  labels?: { prev: string; next: string }
}

/**
 * Flechas de navegación en HTML, fuera del lienzo 3D.
 * Se desactivan en el primer y el último spread.
 */
export function BookArrows({
  className = 'pliego-arrows',
  style,
  labels = { prev: 'Página anterior', next: 'Página siguiente' },
}: BookArrowsProps) {
  const { current, count, isFirst, isLast, next, prev } = useBook()
  // Con la bisagra arriba se lee hacia abajo: anterior ↑ y siguiente ↓.
  const top = useBookStore((state) => state.hinge) === 'top'
  return (
    <nav className={className} style={style} aria-label="Navegación del libro">
      <button type="button" onClick={prev} disabled={isFirst} aria-label={labels.prev}>
        <span aria-hidden="true">{top ? '↑' : '←'}</span>
      </button>
      <span className="pliego-arrows__page" aria-live="polite">
        {current} / {count}
      </span>
      <button type="button" onClick={next} disabled={isLast} aria-label={labels.next}>
        <span aria-hidden="true">{top ? '↓' : '→'}</span>
      </button>
    </nav>
  )
}
