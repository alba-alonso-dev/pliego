import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { ExtrudeGeometry, Matrix4, Shape, Vector2, Vector3, type Mesh } from 'three'
import { paperMaterials } from '../materials/paper'
import { vFold, vFoldRises, vFoldValleys, type Vec3 } from '../math/v-fold'
import { warnOnce } from '../warn'
import { DEFAULT_PAPER_DEPTH } from './Paper'
import { DEFAULT_TAB } from './FoldPanel'
import {
  MechanismPartsContext,
  MechanismRoot,
  PanelFrame,
  useFoldSupport,
  type MechanismParts,
} from './FoldSupport'

export interface VFoldProps {
  /** Vértice de la V sobre el lomo: de -alto/2 (fondo) a +alto/2 (frente). */
  at?: number
  /** Ángulo entre cada línea de pegado y el lomo, en grados. */
  glueAngle?: number
  /**
   * Ángulo de la pieza entre su pliegue central y cada línea de pegado, en
   * grados. Con 90 queda de pie; con menos, se inclina hacia donde van las
   * líneas de pegado. Debe ser al menos `glueAngle`.
   */
  pieceAngle?: number
  /** Largo de cada línea de pegado. */
  base?: number
  /** Largo del pliegue central. */
  height?: number
  /** Hacia dónde van las líneas de pegado desde el vértice. */
  toward?: 'back' | 'front'
  color?: string
  /** Ancho de las pestañas de pegado, tumbadas junto a cada línea de pegado (0 = sin pestañas). */
  tabs?: number
  /**
   * Capas montadas sobre la V: `<Valley side>` (en el pliegue entre un
   * panel y su página: V en cascada) u `<OnPanel side>` (pegado a un panel).
   */
  children?: ReactNode
}

const DEG = Math.PI / 180

/**
 * Pliegue en V de papel de verdad: la pieza que pone figuras de pie con el
 * libro abierto del todo. Dos paneles pegados a las dos páginas, unidos por
 * un pliegue central; su postura la impone la apertura del libro.
 *
 * ```tsx
 * <VFold at={0.3} glueAngle={30} pieceAngle={70} height={0.35} color="#5b8e7d" />
 * ```
 */
export function VFold(props: VFoldProps) {
  return (
    <MechanismRoot>
      <VFoldPieces {...props} />
    </MechanismRoot>
  )
}

function VFoldPieces({
  at = 0,
  glueAngle = 30,
  pieceAngle = 70,
  base = 0.3,
  height = 0.35,
  toward = 'back',
  color = '#f4ead5',
  tabs = DEFAULT_TAB,
  children,
}: VFoldProps) {
  const { theta } = useFoldSupport()
  const alpha = glueAngle * DEG
  const beta = pieceAngle * DEG
  const sign = toward === 'back' ? -1 : 1

  useEffect(() => {
    if (!vFoldRises(alpha, beta)) {
      warnOnce(
        `<VFold> no se levantaría: pieceAngle (${pieceAngle}°) debe ser al menos glueAngle (${glueAngle}°).`,
      )
    }
  }, [alpha, beta, glueAngle, pieceAngle])

  // El panel es rígido: un paralelogramo entre su línea de pegado (eje X
  // local) y el pliegue central, que forma el ángulo β con ella.
  const geometry = useMemo(() => {
    const cx = Math.cos(beta) * height
    const cy = Math.sin(beta) * height
    const shape = new Shape([
      new Vector2(0, 0),
      new Vector2(base, 0),
      new Vector2(base + cx, cy),
      new Vector2(cx, cy),
    ])
    const extruded = new ExtrudeGeometry(shape, {
      depth: DEFAULT_PAPER_DEPTH,
      bevelEnabled: false,
    })
    extruded.translate(0, 0, -DEFAULT_PAPER_DEPTH / 2)
    return extruded
  }, [base, height, beta])
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(() => {
    const { face, edge } = paperMaterials(color)
    return [face, edge]
  }, [color])

  const pose = () => vFold(theta(), alpha, beta, sign)

  const parts = useMemo<MechanismParts>(() => {
    const solve = () => vFold(theta(), alpha, beta, sign)
    const valleys = () => vFoldValleys(solve(), theta(), base)
    return {
      valleys: { right: () => valleys().right, left: () => valleys().left },
      panels: {
        right: () => {
          const p = solve()
          return { origin: [0, 0, 0], x: p.right, y: p.crease }
        },
        left: () => {
          const p = solve()
          return { origin: [0, 0, 0], x: p.left, y: p.crease }
        },
      },
    }
  }, [theta, alpha, beta, sign, base])

  return (
    <group position={[0, 0, at]}>
      <MechanismPartsContext.Provider value={parts}>{children}</MechanismPartsContext.Provider>
      <VPanel geometry={geometry} material={material} glue={() => pose().right} pose={pose} />
      <VPanel geometry={geometry} material={material} glue={() => pose().left} pose={pose} />
      {tabs > 0 &&
        (['right', 'left'] as const).map((side) => (
          <PanelFrame
            key={side}
            pose={() => {
              const p = pose()
              const valley = vFoldValleys(p, theta(), base)[side]
              // La pestaña se tumba sobre la página, hacia fuera de la V.
              const out = side === 'right' ? valley.right : valley.left
              return { origin: [0, 0, 0], x: p[side], y: out }
            }}
          >
            <mesh position={[base / 2, tabs / 2, 0]} material={material[0]} receiveShadow>
              <boxGeometry args={[base, tabs, DEFAULT_PAPER_DEPTH]} />
            </mesh>
          </PanelFrame>
        ))}
    </group>
  )
}

interface VPanelProps {
  geometry: ExtrudeGeometry
  material: ReturnType<typeof paperMaterials>['face'][]
  glue: () => Vec3
  pose: () => { crease: Vec3 }
}

const e1 = new Vector3()
const e2 = new Vector3()
const n = new Vector3()
const basis = new Matrix4()

/** Un panel de la V: orienta su plano con su línea de pegado y el pliegue central. */
function VPanel({ geometry, material, glue, pose }: VPanelProps) {
  const mesh = useRef<Mesh>(null)
  useFrame(() => {
    if (!mesh.current) return
    e1.set(...glue()).normalize()
    const crease = new Vector3(...pose().crease)
    // Eje Y local: dentro del plano del panel, perpendicular a la línea de pegado.
    e2.copy(crease).addScaledVector(e1, -crease.dot(e1))
    if (e2.lengthSq() < 1e-10) e2.set(0, 1, 0)
    e2.normalize()
    n.crossVectors(e1, e2)
    basis.makeBasis(e1, e2, n)
    mesh.current.quaternion.setFromRotationMatrix(basis)
  })
  return <mesh ref={mesh} geometry={geometry} material={material} castShadow receiveShadow />
}
