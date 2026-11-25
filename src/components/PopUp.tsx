import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { depthDelay, elevation, pivotRotationX } from '../math/fold'
import { DEFAULT_PAPER_DEPTH } from './Paper'
import { useBookContext } from './context'
import { OnPage } from './OnPage'
import { useSpread } from './Spread'

export interface PopUpProps {
  /**
   * Posición en z de la línea de pliegue: de -alto/2 (fondo de la página)
   * a +alto/2 (frente). Es donde la pieza está «pegada» a la página.
   */
  at?: number
  /** Desplazamiento en x de la pieza (el lomo está en x = 0). */
  x?: number
  /** Ángulo final en grados cuando el spread está plano: 90 = de pie. */
  angle?: number
  /**
   * Retardo (0–1): cuanto mayor, más tarde sube la pieza respecto a la
   * apertura del spread. Por defecto depende de la profundidad (`at`).
   */
  delay?: number
  /** Página a la que va pegada. Por defecto, la del lado de `x`. */
  side?: 'left' | 'right'
  children?: ReactNode
}

/**
 * Pieza pop-up: un pivote en la línea de pliegue que levanta a sus hijos
 * según lo abierto que esté el spread. Los hijos se dibujan de pie en el
 * plano XY, con la base en y = 0 (por ejemplo, `<Paper anchor="bottom">`).
 *
 * La pieza va pegada a su página: al pasar la hoja gira con ella mientras
 * se pliega encima, y con el libro cerrado queda tumbada entre las hojas,
 * como en un libro pop-up de papel.
 */
export function PopUp({ at = 0, x = 0, angle = 90, delay, side, children }: PopUpProps) {
  const { size } = useBookContext()
  const { theta } = useSpread()
  const pivot = useRef<Group>(null)
  const wait = delay ?? depthDelay(at, size[1])
  const page = side ?? (x < 0 ? 'left' : 'right')

  useFrame(() => {
    if (!pivot.current) return
    pivot.current.rotation.x = pivotRotationX(elevation(theta(), angle, wait))
  })

  return (
    // Medio grosor de cartulina para que, tumbada, no atraviese la página.
    <OnPage side={page} lift={DEFAULT_PAPER_DEPTH / 2}>
      <group ref={pivot} position={[x, 0, at]} rotation={[pivotRotationX(0), 0, 0]}>
        {children}
      </group>
    </OnPage>
  )
}
