import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

/** Milisegundos de gracia antes de dar la carga por terminada. */
const GRACE = 400

export interface LoadingScreenProps {
  className?: string
  /** Texto mientras carga. */
  label?: string
  /** Milisegundos del fundido al terminar. */
  fade?: number
}

/**
 * Pantalla de carga con progreso, por encima del lienzo. Sigue lo que
 * cargan los `TextureLoader` y demás cargadores de Three (ilustraciones
 * impresas, texturas…) y se desvanece al terminar. Como todos los spreads
 * se montan desde el principio, al quitarse ya está cargado también el
 * spread siguiente.
 */
export function LoadingScreen({
  className = 'pliego-loading',
  label = 'Cargando…',
  fade = 500,
}: LoadingScreenProps) {
  const { active, progress, total } = useProgress()
  const [gone, setGone] = useState(false)
  // Un momento de gracia al empezar: las imágenes no empiezan a cargarse
  // hasta que se monta el libro, y sin él la pantalla se iría y volvería.
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(true), GRACE)
    return () => window.clearTimeout(timer)
  }, [])
  // Terminado: no hay nada cargándose y, o se ha cargado todo, o no había
  // nada que cargar (un libro sin imágenes no debe quedarse en esta pantalla).
  const done = settled && !active && (progress >= 100 || total === 0)

  useEffect(() => {
    if (!done) return
    const timer = window.setTimeout(() => setGone(true), fade)
    return () => window.clearTimeout(timer)
  }, [done, fade])

  // Si vuelve a cargar algo después, la pantalla reaparece.
  if (gone && done) return null
  return (
    <div
      className={className}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      style={{ opacity: done ? 0 : 1, transition: `opacity ${fade}ms ease` }}
    >
      <p>{label}</p>
      <div className={`${className}-bar`}>
        <div style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
