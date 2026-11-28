// @vitest-environment jsdom
import ReactThreeTestRenderer from '@react-three/test-renderer'
import { act } from 'react'
import type { Group, Mesh, Object3D } from 'three'
import { afterEach, describe, expect, it } from 'vitest'
import { useBookStore } from '../store'
import { Book } from './Book'
import { ParallelFold } from './ParallelFold'
import { HandDrawn } from './HandDrawn'
import { PopUp } from './PopUp'
import { Spread } from './Spread'
import { tentFold } from '../math/parallel-fold'
import { paperMaterials } from '../materials/paper'

/** Un libro de prueba: dos spreads, uno con un pop-up y otro con una tienda. */
function TestBook() {
  return (
    <Book keyboard={false} hash={false} drag={false}>
      <Spread id="uno">
        <PopUp at={0} x={0.4}>
          <mesh name="pieza">
            <boxGeometry args={[0.2, 0.3, 0.01]} />
          </mesh>
        </PopUp>
      </Spread>
      <Spread id="dos">
        <ParallelFold {...tentFold(0.14, 0.24)} width={0.3} />
      </Spread>
    </Book>
  )
}

const find = (root: Object3D, name: string): Object3D => {
  const found = root.getObjectByName(name)
  if (!found) throw new Error(`No está «${name}»`)
  return found
}

async function open(
  page: number,
  renderer: Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>,
) {
  await act(async () => {
    useBookStore.getState().setPosition(page, false)
  })
  await renderer.advanceFrames(2, 1 / 60)
}

afterEach(() => {
  useBookStore.setState({ ids: [], current: 0, position: 0, turning: false })
})

describe('<Book>', () => {
  it('registra sus spreads y crea una hoja por spread más la contratapa', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TestBook />)
    expect(useBookStore.getState().ids).toEqual(['uno', 'dos'])
    const boxes = renderer.scene.findAll(
      (node) => node.type === 'Mesh' && (node.instance as Mesh).geometry?.type === 'BoxGeometry',
    )
    // Contratapa + 2 hojas + la pieza de prueba (los paneles de la tienda también son cajas).
    expect(boxes.length).toBeGreaterThanOrEqual(4)
    await renderer.unmount()
  })

  it('con el libro cerrado no se ve ningún spread; abierto, se ve el suyo', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TestBook />)
    const root = renderer.scene.instance
    await open(0, renderer)
    const pieza = find(root, 'pieza')
    const spreadOf = (o: Object3D) => {
      let p: Object3D | null = o
      while (p && p.parent && p.parent.parent !== root) p = p.parent
      return p
    }
    const visible = (o: Object3D) => {
      for (let p: Object3D | null = o; p; p = p.parent) if (!p.visible) return false
      return true
    }
    expect(visible(pieza)).toBe(false)
    await open(1, renderer)
    expect(visible(pieza)).toBe(true)
    expect(spreadOf(pieza)).not.toBeNull()
    await renderer.unmount()
  })

  it('al pasar la primera hoja, la tapa gira media vuelta', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TestBook />)
    await open(1, renderer)
    const pivots = renderer.scene.children[0]!.instance as Group
    // El primer grupo con rotación en z ≈ π es la tapa ya pasada.
    let turned = false
    pivots.traverse((o) => {
      if (Math.abs(o.rotation.z - Math.PI) < 1e-3) turned = true
    })
    expect(turned).toBe(true)
    await renderer.unmount()
  })
})

describe('<HandDrawn>', () => {
  it('el trazo revelado se ve: la línea y también su material', async () => {
    const trazo =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1 L9 9" fill="none" stroke="#000" /></svg>'
    const renderer = await ReactThreeTestRenderer.create(
      <Book keyboard={false} hash={false} drag={false}>
        <Spread id="uno">
          <HandDrawn src={trazo} x={-0.4} width={0.2} reveal={{ duration: 0.1, delay: 0 }} />
        </Spread>
      </Book>,
    )
    // El revelado avanza con el spread abierto (página de destino) y quieto.
    await act(async () => {
      useBookStore.setState({ current: 1 })
    })
    await open(1, renderer)
    await renderer.advanceFrames(30, 1 / 30)
    let line: Mesh | undefined
    renderer.scene.instance.traverse((o) => {
      if (o.type === 'LineSegments2') line = o as Mesh
    })
    expect(line).toBeDefined()
    const visible = (o: Object3D) => {
      for (let p: Object3D | null = o; p; p = p.parent) if (!p.visible) return false
      return true
    }
    expect(visible(line!)).toBe(true)
    expect((line!.material as { visible: boolean }).visible).toBe(true)
    await renderer.unmount()
  })
})

describe('<Book cover>', () => {
  it('lo de la tapa se ve cerrado y deja de verse al abrir el libro', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Book keyboard={false} hash={false} drag={false} cover={<mesh name="titulo" />}>
        <Spread id="uno" />
        <Spread id="dos" />
      </Book>,
    )
    const visible = (o: Object3D) => {
      for (let p: Object3D | null = o; p; p = p.parent) if (!p.visible) return false
      return true
    }
    await open(0, renderer)
    const titulo = find(renderer.scene.instance, 'titulo')
    expect(visible(titulo)).toBe(true)
    await open(1, renderer)
    expect(visible(titulo)).toBe(false)
    await renderer.unmount()
  })
})

describe('color de papel por spread', () => {
  it('pinta las dos páginas de su spread, también la guarda de la contratapa', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <Book keyboard={false} hash={false} drag={false}>
        <Spread id="uno" pageColor="#aa0000" />
        <Spread id="dos" pageColor="#00aa00" />
      </Book>,
    )
    const red = paperMaterials('#aa0000').face
    const green = paperMaterials('#00aa00').face
    // Orden de materiales de BoxGeometry: +x, -x, +y (delante), -y (detrás), +z, -z.
    const faces = renderer.scene
      .findAll((node) => node.type === 'Mesh' && Array.isArray((node.instance as Mesh).material))
      .map((node) => (node.instance as Mesh).material as unknown[])
    const fronts = faces.filter((m) => m[2] === red).length
    const backs = faces.filter((m) => m[3] === red).length
    // Spread «uno»: detrás de la tapa (izquierda) y delante de la hoja 1 (derecha).
    expect(backs).toBe(1)
    expect(fronts).toBe(1)
    // Spread «dos»: detrás de la hoja 1 y la guarda de la contratapa.
    expect(faces.filter((m) => m[3] === green).length).toBe(1)
    expect(faces.filter((m) => m[2] === green).length).toBe(1)
    await renderer.unmount()
  })
})

describe('piezas', () => {
  it('con el spread abierto, el pop-up está de pie', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TestBook />)
    await open(1, renderer)
    const pivot = find(renderer.scene.instance, 'pieza').parent!
    expect(pivot.rotation.x).toBeCloseTo(0, 2)
    await renderer.unmount()
  })

  it('con el spread cerrándose, el pop-up se tumba', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TestBook />)
    await open(1.98, renderer)
    const pivot = find(renderer.scene.instance, 'pieza').parent!
    expect(pivot.rotation.x).toBeLessThan(-1.3)
    await renderer.unmount()
  })

  it('la tienda se levanta con su spread abierto', async () => {
    const renderer = await ReactThreeTestRenderer.create(<TestBook />)
    await open(2, renderer)
    let highest = 0
    renderer.scene.instance.traverse((o) => {
      if ((o as Mesh).isMesh && o.scale.y < 0.02 && o.scale.x < 0.5) {
        highest = Math.max(highest, o.position.y)
      }
    })
    expect(highest).toBeGreaterThan(0.05)
    await renderer.unmount()
  })
})
