import { useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { Fog } from 'three'
import { damping, fitDistanceFactor, parallaxOffset } from '../math/parallax'
import { prefersReducedMotion } from '../motion'
import { useParallaxPointer } from './useParallaxPointer'

type Vec3 = [number, number, number]

/** Distancias originales de la niebla, para escalarlas sin acumular. */
const fogBase = new WeakMap<Fog, { near: number; far: number }>()

export interface CameraRigProps {
  position: Vec3
  target: Vec3
  /** Recorrido máximo del parallax en unidades del mundo; 0 lo desactiva. */
  parallax: number
  /**
   * Ancho que debe caber siempre en pantalla (el libro abierto). En
   * pantallas estrechas, como un móvil en vertical, la cámara se aleja.
   */
  fitWidth?: number
}

/**
 * Coloca la cámara y la inclina suavemente siguiendo el ratón o la
 * inclinación del móvil, para que las capas del pop-up se separen.
 * Se queda quieta si el usuario prefiere reducir el movimiento.
 */
export function CameraRig({ position, target, parallax, fitWidth = 2.3 }: CameraRigProps) {
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)
  const aspect = useThree((state) => state.size.width / Math.max(1, state.size.height))
  const [tx, ty, tz] = target
  // Alejar la cámara desde el punto al que mira si el libro no cabe de ancho.
  const fov = 'fov' in camera ? (camera as { fov: number }).fov : 40
  const distance = Math.hypot(position[0] - tx, position[1] - ty, position[2] - tz)
  const k = fitDistanceFactor(fitWidth, distance, fov, aspect)
  const px = tx + (position[0] - tx) * k
  const py = ty + (position[1] - ty) * k
  const pz = tz + (position[2] - tz) * k

  // La niebla se aleja con la cámara para no tapar el libro.
  useLayoutEffect(() => {
    const fog = scene.fog
    if (!(fog instanceof Fog)) return
    let base = fogBase.get(fog)
    if (!base) {
      base = { near: fog.near, far: fog.far }
      fogBase.set(fog, base)
    }
    fog.near = base.near * k
    fog.far = base.far * k
  }, [scene, k])

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
