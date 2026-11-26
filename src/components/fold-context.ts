import { createContext, useContext } from 'react'
import { closedOverflow } from '../math/closed-fit'
import type { SupportPose } from '../math/layers'
import type { Vec3 } from '../math/v-fold'
import { warnOnce } from '../warn'

/**
 * Pliegue soporte de un mecanismo: dos planos unidos por una bisagra que
 * va por el eje Z del grupo actual. El soporte derecho va por +X y el
 * izquierdo forma un ángulo `theta()` (radianes) con él, hacia +Y.
 */
export interface FoldSupport {
  theta: () => number
  /**
   * Tamaño de la página `[ancho, alto]` si el pliegue es el lomo del
   * spread; sirve para avisar de piezas que asomarían con el libro cerrado.
   */
  page?: [number, number]
}

export const FoldContext = createContext<FoldSupport | null>(null)

/** Avisa si una pieza asomaría fuera de la página con el libro cerrado. */
export function warnIfOverflows(name: string, support: FoldSupport, points: () => Vec3[]): void {
  if (!support.page) return
  const overflow = closedOverflow(points(), support.page)
  if (overflow > 1e-3) {
    warnOnce(`<${name}> asomaría ${overflow.toFixed(3)} fuera de la página con el libro cerrado.`)
  }
}

/** El pliegue soporte en el que está montado el componente. */
export function useFoldSupport(): FoldSupport {
  const support = useContext(FoldContext)
  if (!support) throw new Error('Este mecanismo debe ir dentro de un <Spread> o de otro mecanismo')
  return support
}

/** Marco de un panel: origen y dos ejes dentro de su plano. */
export interface PanelPose {
  origin: Vec3
  x: Vec3
  y: Vec3
}

/** Pliegues y paneles que un mecanismo ofrece para montar capas. */
export interface MechanismParts {
  valleys: Partial<Record<'left' | 'right', () => SupportPose>>
  panels: Partial<Record<'left' | 'right', () => PanelPose>>
}

export const MechanismPartsContext = createContext<MechanismParts | null>(null)
