import { bisector, leftSupport, type Vec2 } from './parallel-fold'

/**
 * Plataforma flotante (caja de Low et al., 2013): una «espina» de alto `h`
 * pegada en el lomo por la bisectriz, dos paredes pegadas a las páginas a
 * distancia `d` del lomo y una tapa partida en dos mitades unidas en lo
 * alto de la espina.
 *
 * Cada lado es un paralelogramo (lomo, pegado, esquina, alto de la espina),
 * así que las mitades de la tapa quedan siempre paralelas a su página: con
 * el libro plano la tapa es un suelo horizontal a altura `h`, y con el
 * libro cerrado todo queda plano. Por eso la tapa se comporta como un libro
 * más: se pueden montar otros mecanismos encima.
 */
export interface FloatingLayerPose {
  /** Alto de la espina, donde se unen las dos mitades de la tapa. */
  top: Vec2
  /** Pegados de las paredes sobre las páginas izquierda y derecha. */
  leftFoot: Vec2
  rightFoot: Vec2
  /** Esquinas de la tapa, en lo alto de cada pared. */
  leftCorner: Vec2
  rightCorner: Vec2
}

export function floatingLayer(theta: number, distance: number, height: number): FloatingLayerPose {
  const [bx, by] = bisector(theta)
  const [lx, ly] = leftSupport(theta)
  const top: Vec2 = [height * bx, height * by]
  const leftFoot: Vec2 = [distance * lx, distance * ly]
  const rightFoot: Vec2 = [distance, 0]
  return {
    top,
    leftFoot,
    rightFoot,
    leftCorner: [leftFoot[0] + top[0], leftFoot[1] + top[1]],
    rightCorner: [rightFoot[0] + top[0], rightFoot[1] + top[1]],
  }
}
