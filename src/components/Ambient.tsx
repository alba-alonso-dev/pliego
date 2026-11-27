import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group, Object3D } from 'three'
import { bobOffset, spinAngle, swayAngle } from '../math/ambient'
import { prefersReducedMotion } from '../motion'
import { requestRender } from '../render-on-demand'

/**
 * ¿Se ve la pieza? Solo entonces su animación pide fotogramas: una pieza en
 * un spread oculto no tiene por qué mantener el lienzo pintando.
 */
function shown(object: Object3D | null): boolean {
  for (let o = object; o; o = o.parent) if (!o.visible) return false
  return object !== null
}

interface AmbientProps {
  children?: ReactNode
  /** Desfase en segundos, para que dos piezas iguales no vayan a la par. */
  phase?: number
}

export interface SpinProps extends AmbientProps {
  /** Vueltas por segundo (negativo = al revés). */
  speed?: number
  /** Eje de giro. */
  axis?: 'x' | 'y' | 'z'
}

/** Giro continuo, como las aspas de un molino. */
export function Spin({ speed = 0.3, axis = 'z', phase = 0, children }: SpinProps) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!group.current || prefersReducedMotion()) return
    group.current.rotation[axis] = spinAngle(clock.elapsedTime + phase, speed)
    if (shown(group.current)) requestRender(0.1)
  })
  return <group ref={group}>{children}</group>
}

export interface SwayProps extends AmbientProps {
  /** Amplitud del balanceo en grados. */
  amplitude?: number
  /** Segundos que tarda en ir y volver. */
  period?: number
  axis?: 'x' | 'y' | 'z'
}

/** Balanceo suave, como un árbol con viento. */
export function Sway({ amplitude = 4, period = 3, axis = 'z', phase = 0, children }: SwayProps) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    const angle = prefersReducedMotion()
      ? 0
      : swayAngle(clock.elapsedTime, (amplitude * Math.PI) / 180, period, phase)
    group.current.rotation[axis] = angle
    if (!prefersReducedMotion() && shown(group.current)) requestRender(0.1)
  })
  return <group ref={group}>{children}</group>
}

export interface BobProps extends AmbientProps {
  /** Cuánto sube y baja, en unidades del mundo. */
  amplitude?: number
  period?: number
}

/** Flotar: sube y baja despacio, como una nube. */
export function Bob({ amplitude = 0.012, period = 4, phase = 0, children }: BobProps) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.position.y = prefersReducedMotion()
      ? 0
      : bobOffset(clock.elapsedTime, amplitude, period, phase)
    if (!prefersReducedMotion() && shown(group.current)) requestRender(0.1)
  })
  return <group ref={group}>{children}</group>
}
