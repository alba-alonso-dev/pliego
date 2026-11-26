import type { ReactNode } from 'react'
import { floatingLayer } from '../math/floating-layer'
import { DEFAULT_TAB, FoldPanel } from './FoldPanel'
import { FoldFrame, MechanismRoot, useFoldSupport } from './FoldSupport'
import { DEFAULT_PAPER_DEPTH } from './Paper'

export interface FloatingLayerProps {
  /** Distancia de cada pared al lomo (la mitad del ancho del suelo). */
  distance?: number
  /** Altura del suelo con el libro plano. */
  height?: number
  /** Centro a lo largo del lomo: de -alto/2 (fondo) a +alto/2 (frente). */
  at?: number
  /** Fondo de la plataforma a lo largo del lomo. */
  width?: number
  color?: string
  /** Largo de las pestañas de pegado de las paredes (0 = sin pestañas). */
  tabs?: number
  /**
   * Mecanismos montados sobre el suelo (`<ParallelFold>`, `<VFold>`, otra
   * `<FloatingLayer>`…). El suelo se comporta como un libro más: su
   * bisagra es la unión de las dos mitades, en el centro.
   */
  children?: ReactNode
}

/**
 * Plataforma flotante: un suelo elevado sobre el spread, sujeto por dos
 * paredes y una espina en el lomo. Se pliega plana al cerrar el libro y
 * sirve de base para montar otros mecanismos encima.
 *
 * ```tsx
 * <FloatingLayer distance={0.25} height={0.12} width={0.4}>
 *   <ParallelFold {...tentFold(0.1, 0.16)} width={0.3} />
 * </FloatingLayer>
 * ```
 */
export function FloatingLayer(props: FloatingLayerProps) {
  return (
    <MechanismRoot>
      <FloatingLayerPieces {...props} />
    </MechanismRoot>
  )
}

function FloatingLayerPieces({
  distance = 0.25,
  height = 0.12,
  at = 0,
  width = 0.4,
  color = '#f4ead5',
  tabs = DEFAULT_TAB,
  children,
}: FloatingLayerProps) {
  const { theta } = useFoldSupport()
  const pose = () => floatingLayer(theta(), distance, height)
  const panel = (pick: (p: ReturnType<typeof pose>) => [[number, number], [number, number]]) => (
    <FoldPanel ends={() => pick(pose())} width={width} z={at} color={color} />
  )

  return (
    <>
      {panel((p) => [[0, 0], p.top])}
      {panel((p) => [p.leftFoot, p.leftCorner])}
      {panel((p) => [p.rightFoot, p.rightCorner])}
      {panel((p) => [p.top, p.leftCorner])}
      {panel((p) => [p.top, p.rightCorner])}
      {tabs > 0 &&
        panel((p) => {
          const t = theta()
          return [
            p.leftFoot,
            [p.leftFoot[0] + tabs * Math.cos(t), p.leftFoot[1] + tabs * Math.sin(t)],
          ]
        })}
      {tabs > 0 && panel((p) => [p.rightFoot, [p.rightFoot[0] + tabs, p.rightFoot[1]]])}
      {/* Las mitades del suelo son paralelas a las páginas: misma apertura que el libro. */}
      <FoldFrame
        pose={() => {
          const [x, y] = pose().top
          const t = theta()
          return {
            origin: [x, y + DEFAULT_PAPER_DEPTH, at],
            right: [1, 0, 0],
            left: [Math.cos(t), Math.sin(t), 0],
            hinge: [0, 0, 1],
          }
        }}
      >
        {children}
      </FoldFrame>
    </>
  )
}
