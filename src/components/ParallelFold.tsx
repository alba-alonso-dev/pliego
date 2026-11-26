import { useEffect, useMemo, type ReactNode } from 'react'
import { isFoldable, leftSupport, parallelFold, type ParallelFoldSpec } from '../math/parallel-fold'
import { warnOnce } from '../warn'
import { DEFAULT_TAB, FoldPanel } from './FoldPanel'
import {
  MechanismPartsContext,
  MechanismRoot,
  useFoldSupport,
  type MechanismParts,
} from './FoldSupport'

export interface ParallelFoldProps extends ParallelFoldSpec {
  /** Centro de la pieza a lo largo del lomo: de -alto/2 (fondo) a +alto/2 (frente). */
  at?: number
  /** Ancho de la pieza a lo largo del lomo. */
  width?: number
  color?: string
  /** Largo de las pestañas de pegado, tumbadas sobre las páginas (0 = sin pestañas). */
  tabs?: number
  /**
   * Capas montadas sobre la pieza: `<Valley side>` (en el pliegue entre un
   * panel y su página) u `<OnPanel side>` (pegado a un panel, gira con él).
   */
  children?: ReactNode
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
  tabs = DEFAULT_TAB,
  children,
}: ParallelFoldProps) {
  const { theta } = useFoldSupport()
  const spec = { a, b, left, right }
  const pose = () => parallelFold(theta(), spec)

  const parts = useMemo<MechanismParts>(() => {
    const solve = () => parallelFold(theta(), { a, b, left, right })
    const dir = (from: [number, number], to: [number, number]): [number, number, number] => [
      to[0] - from[0],
      to[1] - from[1],
      0,
    ]
    return {
      valleys: {
        right: () => {
          const { B, C } = solve()
          return { origin: [B[0], B[1], at], right: [1, 0, 0], left: dir(B, C), hinge: [0, 0, 1] }
        },
        left: () => {
          const { A, C } = solve()
          const [lx, ly] = leftSupport(theta())
          return { origin: [A[0], A[1], at], right: dir(A, C), left: [lx, ly, 0], hinge: [0, 0, 1] }
        },
      },
      panels: {
        right: () => {
          const { B, C } = solve()
          return { origin: [B[0], B[1], at], x: dir(B, C), y: [0, 0, 1] }
        },
        left: () => {
          const { A, C } = solve()
          return { origin: [A[0], A[1], at], x: dir(A, C), y: [0, 0, -1] }
        },
      },
    }
  }, [theta, a, b, left, right, at])

  useEffect(() => {
    if (!isFoldable(spec, 1e-3)) {
      warnOnce(
        `<ParallelFold> no se plegaría: a + left (${a + left}) debe ser igual a b + right (${b + right}).`,
      )
    }
  })

  return (
    <MechanismPartsContext.Provider value={parts}>
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
      {tabs > 0 && (
        <>
          <FoldPanel
            ends={() => {
              const { A } = pose()
              const [lx, ly] = leftSupport(theta())
              return [A, [A[0] + tabs * lx, A[1] + tabs * ly]]
            }}
            width={width}
            z={at}
            color={color}
          />
          <FoldPanel
            ends={() => {
              const { B } = pose()
              return [B, [B[0] + tabs, B[1]]]
            }}
            width={width}
            z={at}
            color={color}
          />
        </>
      )}
      {children}
    </MechanismPartsContext.Provider>
  )
}
