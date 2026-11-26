import gsap from 'gsap'
import { turnDuration } from './math/book'
import { prefersReducedMotion } from './motion'
import { playPaper } from './sound'
import { useBookStore } from './store'

let tween: gsap.core.Tween | null = null

/** Detiene la animación en curso (por ejemplo, al empezar a arrastrar). */
export function stopTurn(): void {
  tween?.kill()
  tween = null
}

/** Anima la posición del libro hasta `target` pasando las hojas necesarias. */
export function animateTo(target: number): void {
  stopTurn()
  const { position, setPosition } = useBookStore.getState()
  const duration = prefersReducedMotion() ? 0 : turnDuration(position, target)
  if (duration === 0) {
    setPosition(target, false)
    return
  }
  // Una hoja que empieza a moverse suena (si el sonido está activado).
  if (Math.abs(target - position) > 0.2) playPaper('turn')
  const proxy = { position }
  tween = gsap.to(proxy, {
    position: target,
    duration,
    ease: 'none',
    onUpdate: () => setPosition(proxy.position, true),
    onComplete: () => {
      setPosition(target, false)
      tween = null
    },
  })
}
