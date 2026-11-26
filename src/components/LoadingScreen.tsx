import { useProgress } from '@react-three/drei'
import { useEffect, useState } from 'react'

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
  const { active, progress } = useProgress()
  const [gone, setGone] = useState(false)
  const done = !active && progress >= 100

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
