import { describe, expect, it } from 'vitest'
import { supportFrame } from './layers'
import { leftSupport } from './parallel-fold'

describe('supportFrame', () => {
  it('el lomo del libro da el marco de siempre', () => {
    const theta = (130 * Math.PI) / 180
    const [lx, ly] = leftSupport(theta)
    const frame = supportFrame({
      origin: [0, 0, 0],
      right: [1, 0, 0],
      left: [lx, ly, 0],
      hinge: [0, 0, 1],
    })
    expect(frame.theta).toBeCloseTo(theta)
    expect(frame.z[2]).toBeCloseTo(1)
    expect(frame.y[1]).toBeCloseTo(1)
  })

  it('un pliegue cualquiera: X por el soporte derecho y el izquierdo girado θ hacia Y', () => {
    const frame = supportFrame({
      origin: [0, 0, 0],
      right: [0, 0, 1],
      left: [0, 1, 0],
      hinge: [1, 0, 0],
    })
    expect(frame.theta).toBeCloseTo(Math.PI / 2)
    expect(frame.x).toEqual([0, 0, 1])
    expect(frame.y[1]).toBeCloseTo(1)
  })

  it('cerrado del todo usa la bisagra indicada', () => {
    const frame = supportFrame({
      origin: [0, 0, 0],
      right: [1, 0, 0],
      left: [1, 0, 0],
      hinge: [0, 0, 1],
    })
    expect(frame.theta).toBeCloseTo(0)
    expect(frame.z).toEqual([0, 0, 1])
  })
})
