import { useEffect, useId, useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { paperMaterials } from '../materials/paper'
import { lerp } from '../math/easing'
import { linkedProgress, sectorOutline } from '../math/movables'
import { useMovablesStore } from '../movables-store'
import { playPaper, type PaperSound } from '../sound'
import { useBookContext } from './context'
import { OnPage } from './OnPage'
import { DEFAULT_PAPER_DEPTH, Paper } from './Paper'
import { useSpread } from './useSpread'
import { MovableContext, useMovable } from './movable-context'
import { useGesture, type Gesture } from './useGesture'
import { useSpreadFrame } from './spread-frame'

type Side = 'left' | 'right'
type Vec3 = [number, number, number]

/** Altura de los movibles sobre el papel: por encima de lo impreso. */
const MOVABLE_LIFT = 0.002

/** Props del gesto que, además, suenan al empezar a mover la pieza. */
function withSound(gesture: Gesture, kind: PaperSound): Gesture['bind'] {
  return {
    ...gesture.bind,
    onPointerDown: (event) => {
      playPaper(kind)
      gesture.bind.onPointerDown(event)
    },
  }
}

/** Registra el movible para que se pueda manejar también con `<MovableControls>`. */
function useRegister(gesture: Gesture, label: string, kind: 'toggle' | 'range') {
  const id = useId()
  const { index } = useSpread()
  const register = useMovablesStore((state) => state.register)
  useEffect(
    () =>
      register({
        id,
        spread: index,
        label,
        kind,
        progress: gesture.progress,
        set: gesture.set,
        toggle: gesture.toggle,
      }),
    [id, index, label, kind, gesture, register],
  )
}

export interface PullTabProps {
  side: Side
  /** Posición de la lengüeta a lo largo de la página (z). */
  at?: number
  /** Texto accesible: qué pasa al tirar. */
  label: string
  /** Cuánto sale la lengüeta al tirar del todo. */
  pull?: number
  color?: string
  /** Piezas que mueve: `<Linked>` u otros componentes que usen `useMovable()`. */
  children?: ReactNode
}

/**
 * Lengüeta: una tira que asoma por el borde de la página. Al tirar de ella
 * (arrastrándola hacia fuera) mueve las piezas enlazadas.
 */
export function PullTab({
  side,
  at = 0,
  label,
  pull = 0.2,
  color = '#e9c46a',
  children,
}: PullTabProps) {
  const { size } = useBookContext()
  const sign = side === 'right' ? 1 : -1
  const gesture = useGesture({ mode: 'drag', axis: 'x', invert: side === 'left', distance: 160 })
  useRegister(gesture, label, 'range')
  const tab = useRef<Group>(null)
  const edge = size[0] - 0.12

  useSpreadFrame(() => {
    if (tab.current) tab.current.position.x = sign * (edge + gesture.progress() * pull)
  })

  return (
    <MovableContext.Provider value={gesture}>
      <OnPage side={side} lift={MOVABLE_LIFT}>
        <group ref={tab} position={[sign * edge, 0, at]} {...withSound(gesture, 'slide')}>
          <mesh position={[(sign * 0.18) / 2, 0, 0]} material={paperMaterials(color).face}>
            <boxGeometry args={[0.18, DEFAULT_PAPER_DEPTH, 0.07]} />
          </mesh>
        </group>
        {children}
      </OnPage>
    </MovableContext.Provider>
  )
}

export interface LinkedProps {
  /** Posición de la pieza con la lengüeta sin tirar. */
  from: Vec3
  /** Posición con la lengüeta del todo fuera. */
  to: Vec3
  /** Giro en Y (grados) al principio y al final. */
  turn?: [number, number]
  /** Fracción del recorrido de la lengüeta antes de empezar a moverse. */
  delay?: number
  children?: ReactNode
}

/** Pieza enlazada a una lengüeta: se mueve de `from` a `to` al tirar. */
export function Linked({ from, to, turn = [0, 0], delay = 0, children }: LinkedProps) {
  const progress = useMovable()
  const group = useRef<Group>(null)
  useSpreadFrame(() => {
    if (!group.current) return
    const t = linkedProgress(progress(), delay)
    group.current.position.set(
      lerp(from[0], to[0], t),
      lerp(from[1], to[1], t),
      lerp(from[2], to[2], t),
    )
    group.current.rotation.y = (lerp(turn[0], turn[1], t) * Math.PI) / 180
  })
  return (
    <group ref={group} position={from}>
      {children}
    </group>
  )
}

export interface VolvelleProps {
  side: Side
  /** Centro de la rueda en el spread. */
  x?: number
  at?: number
  radius?: number
  label: string
  /** Vueltas completas al recorrer todo el rango. */
  turns?: number
  color?: string
  /**
   * Tapa con una ventana en forma de sector: solo deja ver una parte de la
   * rueda. Color de la tapa, o `false` para dejar la rueda a la vista.
   */
  cover?: string | false
  /** Contenido de la rueda, tumbado sobre el disco (gira con él). */
  children?: ReactNode
}

/** Rueda (volvelle): un disco que gira al arrastrarlo de lado a lado. */
export function Volvelle({
  side,
  x = side === 'right' ? 0.5 : -0.5,
  at = 0,
  radius = 0.25,
  label,
  turns = 1,
  color = '#f4ead5',
  cover = false,
  children,
}: VolvelleProps) {
  const gesture = useGesture({ mode: 'drag', axis: 'x', distance: 300 })
  useRegister(gesture, label, 'range')
  const disc = useRef<Group>(null)
  useSpreadFrame(() => {
    if (disc.current) disc.current.rotation.y = -gesture.progress() * turns * Math.PI * 2
  })
  const size = radius * 2.3
  const coverOutline = {
    contour: [
      [-size / 2, -size / 2],
      [size / 2, -size / 2],
      [size / 2, size / 2],
      [-size / 2, size / 2],
    ] as [number, number][],
    holes: [sectorOutline(radius * 0.35, radius * 0.92, Math.PI / 3, (2 * Math.PI) / 3)],
  }

  return (
    <MovableContext.Provider value={gesture}>
      <OnPage side={side} lift={MOVABLE_LIFT}>
        <group position={[x, 0, at]}>
          <group ref={disc} {...withSound(gesture, 'slide')}>
            <mesh material={paperMaterials(color).face} receiveShadow>
              <cylinderGeometry args={[radius, radius, DEFAULT_PAPER_DEPTH, 48]} />
            </mesh>
            <group position={[0, DEFAULT_PAPER_DEPTH / 2 + 0.0005, 0]}>{children}</group>
          </group>
          {cover && (
            <group position={[0, DEFAULT_PAPER_DEPTH * 1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <Paper
                outlines={[coverOutline]}
                width={size}
                anchor="center"
                color={cover}
                roughEdges={false}
              />
            </group>
          )}
        </group>
      </OnPage>
    </MovableContext.Provider>
  )
}

export interface FlapProps {
  side: Side
  x?: number
  at?: number
  width?: number
  height?: number
  label: string
  /** Por dónde va pegada la solapa. */
  hinge?: 'back' | 'front'
  color?: string
  /** Lo que va dibujado encima de la solapa (tumbado sobre ella). */
  children?: ReactNode
}

/**
 * Solapa: un trozo de papel pegado por un lado que se levanta con un clic
 * para descubrir lo que hay debajo.
 */
export function Flap({
  side,
  x = side === 'right' ? 0.5 : -0.5,
  at = 0,
  width = 0.3,
  height = 0.3,
  label,
  hinge = 'back',
  color = '#f4ead5',
  children,
}: FlapProps) {
  const gesture = useGesture({ mode: 'click', duration: 0.6 })
  useRegister(gesture, label, 'toggle')
  const leaf = useRef<Group>(null)
  const sign = hinge === 'back' ? 1 : -1
  useSpreadFrame(() => {
    if (leaf.current) leaf.current.rotation.x = (-sign * gesture.progress() * (165 * Math.PI)) / 180
  })
  return (
    <MovableContext.Provider value={gesture}>
      <OnPage side={side} lift={MOVABLE_LIFT * 2}>
        {/* La solapa queda algo por encima de lo que tapa. */}
        <group position={[x, DEFAULT_PAPER_DEPTH / 2 + 0.003, at - (sign * height) / 2]}>
          <group ref={leaf} {...withSound(gesture, 'flap')}>
            <mesh
              position={[0, 0, (sign * height) / 2]}
              material={paperMaterials(color).face}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[width, DEFAULT_PAPER_DEPTH, height]} />
            </mesh>
            <group position={[0, DEFAULT_PAPER_DEPTH / 2 + 0.0005, (sign * height) / 2]}>
              {children}
            </group>
          </group>
        </group>
      </OnPage>
    </MovableContext.Provider>
  )
}
