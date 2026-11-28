import { describe, expect, it } from 'vitest'
import {
  gutter,
  leafAngle,
  leafPose,
  leafProgress,
  leafThickness,
  pageFrame,
  leftStackY,
  rightStackY,
  spreadSurfaceY,
  spreadTheta,
  turnDuration,
} from './book'

const t = { cover: 0.02, page: 0.004 }

describe('leafProgress', () => {
  it('las hojas giran una detrás de otra', () => {
    expect(leafProgress(0, 0)).toBe(0)
    expect(leafProgress(0.5, 0)).toBe(0.5)
    expect(leafProgress(1.5, 0)).toBe(1)
    expect(leafProgress(1.5, 1)).toBe(0.5)
    expect(leafProgress(1.5, 2)).toBe(0)
  })
})

describe('leafAngle', () => {
  it('va de 0 a π', () => {
    expect(leafAngle(0, 0)).toBe(0)
    expect(leafAngle(1, 0)).toBeCloseTo(Math.PI)
  })
})

describe('pilas de hojas', () => {
  it('a la derecha, la tapa queda arriba del todo', () => {
    const count = 3
    expect(rightStackY(0, count, t)).toBeGreaterThan(rightStackY(1, count, t))
    expect(rightStackY(1, count, t)).toBeGreaterThan(rightStackY(2, count, t))
  })

  it('a la derecha, la última hoja descansa sobre la contratapa', () => {
    expect(rightStackY(2, 3, t)).toBeCloseTo(t.cover + t.page / 2)
  })

  it('a la izquierda, la tapa queda debajo del todo', () => {
    expect(leftStackY(0, t)).toBeCloseTo(t.cover / 2)
    expect(leftStackY(1, t)).toBeCloseTo(t.cover + t.page / 2)
  })
})

describe('spreadTheta', () => {
  const count = 3

  it('el spread abierto está plano y los demás cerrados', () => {
    expect(spreadTheta(1, 0, count)).toBeCloseTo(180)
    expect(spreadTheta(1, 1, count)).toBeCloseTo(0)
    expect(spreadTheta(0, 0, count)).toBeCloseTo(0)
  })

  it('se cierra mientras se pasa su página derecha', () => {
    const mitad = spreadTheta(1.5, 0, count)
    expect(mitad).toBeGreaterThan(0)
    expect(mitad).toBeLessThan(180)
    expect(spreadTheta(1.5, 1, count)).toBeCloseTo(180 - mitad)
  })

  it('el último spread usa la contratapa como página derecha', () => {
    expect(spreadTheta(count, count - 1, count)).toBeCloseTo(180)
  })
})

describe('spreadSurfaceY', () => {
  it('apoya la escena sobre la página más alta', () => {
    expect(spreadSurfaceY(0, 3, t)).toBeCloseTo(t.cover + 2 * t.page)
    expect(spreadSurfaceY(2, 3, t)).toBeCloseTo(t.cover + 2 * t.page)
  })
})

describe('turnDuration', () => {
  it('no anima si no hay que moverse', () => {
    expect(turnDuration(2, 2)).toBe(0)
  })

  it('tarda más cuantas más hojas hay que pasar, con un tope', () => {
    expect(turnDuration(0, 1)).toBeLessThan(turnDuration(0, 3))
    expect(turnDuration(0, 20)).toBe(turnDuration(0, 6))
  })

  it('una hoja tarda algo más de un segundo, sin prisa', () => {
    expect(turnDuration(1, 2)).toBeGreaterThan(1)
    expect(turnDuration(1, 2)).toBeLessThan(1.4)
  })
})

describe('pageFrame', () => {
  const count = 3

  it('con el spread abierto, las dos páginas están planas en su lado', () => {
    const left = pageFrame(1, 0, 'left', count, t)
    const right = pageFrame(1, 0, 'right', count, t)
    expect(left.rotation).toBeCloseTo(0)
    expect(right.rotation).toBeCloseTo(0)
    expect(left.y + left.surface).toBeCloseTo(t.cover)
    expect(right.y + right.surface).toBeCloseTo(t.cover + 2 * t.page)
  })

  it('al pasar la hoja, la página derecha gira con ella', () => {
    const right = pageFrame(1.5, 0, 'right', count, t)
    expect(right.rotation).toBeCloseTo(leafAngle(1.5, 1))
    expect(right.rotation).toBeGreaterThan(0)
  })

  it('al volver atrás, la página izquierda se levanta', () => {
    expect(pageFrame(0.5, 0, 'left', count, t).rotation).toBeLessThan(0)
  })

  it('en el último spread la página derecha es la contratapa, que no gira', () => {
    const right = pageFrame(2.5, count - 1, 'right', count, t)
    expect(right.rotation).toBe(0)
    expect(right.y + right.surface).toBeCloseTo(t.cover)
  })
})

describe('grosor por hoja', () => {
  const layered = { cover: 0.03, page: 0.006, pages: [undefined, 0.02, undefined, 0.01] }

  it('cada hoja puede tener su propio grosor', () => {
    expect(leafThickness(0, layered)).toBe(0.03)
    expect(leafThickness(1, layered)).toBe(0.02)
    expect(leafThickness(2, layered)).toBe(0.006)
    expect(leafThickness(3, layered)).toBe(0.01)
  })

  it('las pilas suman los grosores reales', () => {
    // Pila derecha de la hoja 1 con 4 hojas: contratapa + hojas 2 y 3 + media hoja 1.
    expect(rightStackY(1, 4, layered)).toBeCloseTo(0.03 + 0.006 + 0.01 + 0.01)
  })
})

describe('lomo en abanico', () => {
  // Como Estratos: tapa fina y hojas muy gruesas.
  const thick = { cover: 0.03, page: 0.05 }
  const count = 4
  const width = 1.4
  const top = (pose: { y: number; thickness: number; angle: number }, side: 1 | -1) =>
    pose.y + (side * Math.cos(pose.angle) * pose.thickness) / 2

  it('cerrado no hay abanico: las hojas están planas', () => {
    for (let k = 0; k < count; k++) {
      expect(leafPose(0, k, count, thick, width).angle).toBeCloseTo(0)
    }
    expect(gutter(0, count, thick).squeezeRight).toBe(1)
  })

  it('abierto, la pila alta baja hacia el lomo hasta la altura de la otra', () => {
    const g = gutter(1, count, thick)
    expect(g.right).toBeGreaterThan(g.left)
    expect(g.squeezeRight).toBeLessThan(1)
    expect(g.squeezeLeft).toBe(1)
    // Página derecha del spread abierto: la hoja 1, inclinada hacia el lomo.
    const right = leafPose(1, 1, count, thick, width)
    expect(right.angle).toBeGreaterThan(0)
    // Junto al lomo, las dos páginas abiertas quedan casi a la misma altura.
    const left = leafPose(1, 0, count, thick, width)
    expect(top(right, 1)).toBeCloseTo(top(left, -1), 3)
  })

  it('el borde exterior de la hoja sigue a la altura de su pila', () => {
    const pose = leafPose(1, 1, count, thick, width)
    const outer = pose.y + Math.sin(pose.angle) * width
    expect(outer).toBeCloseTo(rightStackY(1, count, thick), 2)
  })

  it('el spread abierto queda algo por debajo de plano, como sobre una mesa', () => {
    const theta = spreadTheta(1, 0, count, thick, width)
    expect(theta).toBeLessThan(180)
    expect(theta).toBeGreaterThan(160)
  })

  it('los spreads cerrados siguen cerrados aunque sus hojas se abran en abanico', () => {
    expect(spreadTheta(1, 1, count, thick, width)).toBeCloseTo(0)
    expect(spreadTheta(1, 2, count, thick, width)).toBeCloseTo(0)
  })

  it('sin ancho, todo queda como antes', () => {
    expect(spreadTheta(1, 0, count, thick)).toBeCloseTo(180)
    expect(leafPose(1, 1, count, thick).angle).toBeCloseTo(0)
  })

  it('pasar una hoja sigue yendo de un lado a otro sin saltos', () => {
    let previous = leafPose(1, 1, count, thick, width).angle
    for (let i = 1; i <= 20; i++) {
      const angle = leafPose(1 + i / 20, 1, count, thick, width).angle
      expect(angle).toBeGreaterThanOrEqual(previous - 1e-9)
      expect(angle - previous).toBeLessThan(0.4)
      previous = angle
    }
    expect(previous).toBeGreaterThan(Math.PI - 0.3)
  })
})
