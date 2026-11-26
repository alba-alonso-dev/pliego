import { useFrame } from '@react-three/fiber'
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import { Matrix4, Vector3, type Group } from 'three'
import { supportFrame, type SupportPose } from '../math/layers'
import type { Vec3 } from '../math/v-fold'
import { DEFAULT_PAPER_DEPTH } from './Paper'
import { OnPage } from './OnPage'
import { useSpread } from './Spread'

/**
 * Pliegue soporte de un mecanismo: dos planos unidos por una bisagra que
 * va por el eje Z del grupo actual. El soporte derecho va por +X y el
 * izquierdo forma un ángulo `theta()` (radianes) con él, hacia +Y.
 */
export interface FoldSupport {
  theta: () => number
}

const FoldContext = createContext<FoldSupport | null>(null)

/** El pliegue soporte en el que está montado el componente. */
export function useFoldSupport(): FoldSupport {
  const support = useContext(FoldContext)
  if (!support) throw new Error('Este mecanismo debe ir dentro de un <Spread> o de otro mecanismo')
  return support
}

/**
 * Monta un mecanismo: si ya está dentro de otro, usa su pliegue; si no,
 * usa el lomo del spread, pegado a la página derecha.
 */
export function MechanismRoot({ children }: { children?: ReactNode }) {
  const parent = useContext(FoldContext)
  if (parent) return <>{children}</>
  return <SpreadFold>{children}</SpreadFold>
}

function SpreadFold({ children }: { children?: ReactNode }) {
  const { theta } = useSpread()
  const support = useMemo<FoldSupport>(() => ({ theta: () => (theta() * Math.PI) / 180 }), [theta])
  return (
    // Medio grosor de cartulina para que las piezas tumbadas no atraviesen la página.
    <OnPage side="right" lift={DEFAULT_PAPER_DEPTH / 2}>
      <FoldContext.Provider value={support}>{children}</FoldContext.Provider>
    </OnPage>
  )
}

const basis = new Matrix4()
const vx = new Vector3()
const vy = new Vector3()
const vz = new Vector3()

export interface FoldFrameProps {
  /** Pliegue de la pieza de abajo sobre el que se monta. Se llama en cada fotograma. */
  pose: () => SupportPose
  children?: ReactNode
}

/**
 * Crea un pliegue soporte nuevo sobre una pieza, para montar capas: los
 * hijos son mecanismos que usan ese pliegue como si fuera el lomo.
 */
export function FoldFrame({ pose, children }: FoldFrameProps) {
  const group = useRef<Group>(null)
  const support = useMemo<FoldSupport>(() => ({ theta: () => supportFrame(pose()).theta }), [pose])
  useFrame(() => {
    if (!group.current) return
    const current = pose()
    const frame = supportFrame(current)
    basis.makeBasis(vx.set(...frame.x), vy.set(...frame.y), vz.set(...frame.z))
    group.current.quaternion.setFromRotationMatrix(basis)
    group.current.position.set(...current.origin)
  })
  return (
    <group ref={group}>
      <FoldContext.Provider value={support}>{children}</FoldContext.Provider>
    </group>
  )
}

/** Marco de un panel: origen y dos ejes dentro de su plano. */
export interface PanelPose {
  origin: Vec3
  x: Vec3
  y: Vec3
}

/**
 * Pega a sus hijos a un panel de un mecanismo, rígidos con él: giran con
 * el panel al abrir el libro (el «pivote» de la ingeniería de papel).
 * X e Y están en el plano del panel; Z es su normal.
 */
export function PanelFrame({ pose, children }: { pose: () => PanelPose; children?: ReactNode }) {
  const group = useRef<Group>(null)
  useFrame(() => {
    if (!group.current) return
    const { origin, x, y } = pose()
    vx.set(...x).normalize()
    vy.set(...y)
    vy.addScaledVector(vx, -vy.dot(vx)).normalize()
    vz.crossVectors(vx, vy)
    basis.makeBasis(vx, vy, vz)
    group.current.quaternion.setFromRotationMatrix(basis)
    group.current.position.set(...origin)
  })
  return <group ref={group}>{children}</group>
}

/** Pliegues y paneles que un mecanismo ofrece para montar capas. */
export interface MechanismParts {
  valleys: Partial<Record<'left' | 'right', () => SupportPose>>
  panels: Partial<Record<'left' | 'right', () => PanelPose>>
}

export const MechanismPartsContext = createContext<MechanismParts | null>(null)

function useParts(component: string): MechanismParts {
  const parts = useContext(MechanismPartsContext)
  if (!parts) throw new Error(`<${component}> debe ir dentro de un <ParallelFold> o un <VFold>`)
  return parts
}

/**
 * Monta mecanismos en un pliegue «valle» de la pieza: donde un panel se
 * junta con su página (la línea de pegado). Es como se encadenan las V en
 * los libros pop-up: la grande crea el pliegue en el que se apoya la
 * pequeña.
 */
export function Valley({ side, children }: { side: 'left' | 'right'; children?: ReactNode }) {
  const pose = useParts('Valley').valleys[side]
  if (!pose) return null
  return <FoldFrame pose={pose}>{children}</FoldFrame>
}

/** Pega contenido a un panel de la pieza para que gire con él (pivote). */
export function OnPanel({ side, children }: { side: 'left' | 'right'; children?: ReactNode }) {
  const pose = useParts('OnPanel').panels[side]
  if (!pose) return null
  return <PanelFrame pose={pose}>{children}</PanelFrame>
}
