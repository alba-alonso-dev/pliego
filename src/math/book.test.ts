import { describe, expect, it } from 'vitest'
import {
  leafAngle,
  leafProgress,
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
