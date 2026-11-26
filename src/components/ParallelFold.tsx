import { useEffect } from 'react'
import { isFoldable, parallelFold, type ParallelFoldSpec } from '../math/parallel-fold'
import { warnOnce } from '../warn'
import { FoldPanel } from './FoldPanel'
import { MechanismRoot, useFoldSupport } from './FoldSupport'

export interface ParallelFoldProps extends ParallelFoldSpec {
  /** Centro de la pieza a lo largo del lomo: de -alto/2 (fondo) a +alto/2 (frente). */
  at?: number
  /** Ancho de la pieza a lo largo del lomo. */
  width?: number
  color?: string
}

/**
 * Pliegue paralelo de papel de verdad: una pieza pegada a las dos páginas
 * cuyos pliegues son paralelos al lomo. No se anima: su forma la impone
 * la apertura del libro. Con `tentFold()` sale una tienda (de pie con el
 * libro plano) y con `stepFold()` un escalón (completo a 90°).
 *
 * ```tsx
 * <ParallelFold {...tentFold(0.15, 0.25)} at={-0.1} width={0.4} color="#c0614b" />
 * ```
 */
export function ParallelFold(props: ParallelFoldProps) {
  return (
    <MechanismRoot>
      <ParallelFoldPieces {...props} />
    </MechanismRoot>
  )
}

function ParallelFoldPieces({
  a,
  b,
  left,
  right,
  at = 0,
  width = 0.4,
  color = '#f4ead5',
}: ParallelFoldProps) {
  const { theta } = useFoldSupport()
  const spec = { a, b, left, right }
  const pose = () => parallelFold(theta(), spec)

  useEffect(() => {
    if (!isFoldable(spec, 1e-3)) {
      warnOnce(
        `<ParallelFold> no se plegaría: a + left (${a + left}) debe ser igual a b + right (${b + right}).`,
      )
    }
  })

  return (
    <>
      <FoldPanel
        ends={() => {
          const { A, C } = pose()
          return [A, C]
        }}
        width={width}
        z={at}
        color={color}
      />
      <FoldPanel
        ends={() => {
          const { B, C } = pose()
          return [B, C]
        }}
        width={width}
        z={at}
        color={color}
      />
    </>
  )
}
