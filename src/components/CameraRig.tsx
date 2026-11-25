import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { damping, parallaxOffset } from '../math/parallax'
import { prefersReducedMotion } from '../motion'
import { useParallaxPointer } from './useParallaxPointer'

type Vec3 = [number, number, number]

export interface CameraRigProps {
  position: Vec3
  target: Vec3
  /** Recorrido máximo del parallax en unidades del mundo; 0 lo desactiva. */
  parallax: number
}

/**
 * Coloca la cámara y la inclina suavemente siguiendo el ratón o la
 * inclinación del móvil, para que las capas del pop-up se separen.
 * Se queda quieta si el usuario prefiere reducir el movimiento.
 */
export function CameraRig({ position, target, parallax }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const [px, py, pz] = position
  const [tx, ty, tz] = target

  useLayoutEffect(() => {
    camera.position.set(px, py, pz)
    camera.lookAt(tx, ty, tz)
  }, [camera, px, py, pz, tx, ty, tz])

  const enabled = parallax > 0 && !prefersReducedMotion()
  const pointer = useParallaxPointer(enabled)

  useFrame((state, delta) => {
    if (!enabled) return
    const [x, y] = pointer(state)
    const [dx, dy] = parallaxOffset(x, y, parallax)
    const k = damping(3, Math.min(delta, 0.1))
    camera.position.x += (px + dx - camera.position.x) * k
    camera.position.y += (py + dy - camera.position.y) * k
    camera.lookAt(tx, ty, tz)
  })

  return null
}
