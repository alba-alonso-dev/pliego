import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BufferGeometry,
  ClampToEdgeWrapping,
  Float32BufferAttribute,
  DoubleSide,
  MeshStandardMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  type Texture,
} from 'three'
import { paperGrain } from '../materials/paper'
import { damping } from '../math/parallax'
import { layerShift, printedStrips } from '../math/printed'
import { useBookContext } from './context'
import { useReaderTurn } from './facing'
import { OnPage } from './OnPage'
import { useParallaxPointer } from './useParallaxPointer'

export interface PrintedLayerProps {
  /** URL de la imagen (PNG, WebP o SVG con `width` y `height`). */
  src: string
  /** Página sobre la que va impresa. */
  side: 'left' | 'right'
  /**
   * Centro de la capa en x (el lomo está en x = 0). Por defecto, el centro
   * de su página.
   */
  x?: number
  /** Centro de la capa en z. Por defecto, el centro de la página. */
  at?: number
  /** Ancho de la capa. Por defecto, el de la página. */
  width?: number
  /** Alto de la capa. Por defecto, el de la página (o según la imagen si se da `width`). */
  height?: number
  /**
   * Cuánto se desplaza el dibujo con el ratón o el giroscopio, en unidades
   * del mundo: un número o `[x, z]`. 0 = fija (lo normal en el fondo).
   * El dibujo se mueve dentro de su recuadro: deja margen transparente.
   */
  parallax?: number | [number, number]
  /** Orden de apilado: las capas con más orden quedan encima. */
  order?: number
  opacity?: number
}

/** Tiras en que se parte la imagen para seguir la curva de la hoja. */
const STRIPS = 12

/** Separación entre capas impresas, muy por debajo de la tinta y las piezas. */
const LAYER_GAP = 0.00012

/**
 * Ilustración impresa sobre la página: una imagen plana pegada al papel
 * que gira con su hoja, siempre visible. Varias capas con distinto
 * `parallax` dan profundidad sin levantar nada, como en un libro ilustrado.
 * Sirve de fondo de un spread, por debajo de las piezas pop-up.
 */
export function PrintedLayer({
  src,
  side,
  x,
  at = 0,
  width,
  height,
  parallax = 0,
  order = 0,
  opacity = 1,
}: PrintedLayerProps) {
  const { size } = useBookContext()
  const [pageWidth, pageHeight] = size
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    let alive = true
    let loaded: Texture | null = null
    new TextureLoader().load(src, (map) => {
      map.colorSpace = SRGBColorSpace
      map.wrapS = ClampToEdgeWrapping
      map.wrapT = ClampToEdgeWrapping
      map.anisotropy = 8
      loaded = map
      if (alive) setTexture(map)
      else map.dispose()
    })
    return () => {
      alive = false
      loaded?.dispose()
    }
  }, [src])

  const image = texture?.image as { width?: number; height?: number } | undefined
  const aspect = image?.width && image.height ? image.height / image.width : pageHeight / pageWidth
  // Con la bisagra arriba la imagen se gira para mirar al lector y su
  // ancho va a lo largo del lomo.
  const turn = useReaderTurn()
  const [fullW, fullH] = turn ? [pageHeight, pageWidth] : [pageWidth, pageHeight]
  const w = width ?? fullW
  const h = height ?? (width !== undefined ? w * aspect : fullH)
  const cx = x ?? (side === 'left' ? -pageWidth / 2 : pageWidth / 2)

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        transparent: true,
        depthWrite: false,
        roughness: 0.95,
        metalness: 0,
        normalMap: paperGrain(),
        normalScale: new Vector2(0.3, 0.3),
        side: DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1 - order,
      }),
    [order],
  )
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => {
    material.map = texture
    material.opacity = opacity
    material.visible = texture !== null
    material.needsUpdate = true
  }, [material, texture, opacity])

  // Parallax: desplaza el dibujo dentro de su recuadro moviendo la textura.
  const pointer = useParallaxPointer(parallax !== 0)
  const shift = useRef<[number, number]>([0, 0])
  const [ax, az] = typeof parallax === 'number' ? [parallax, parallax] : parallax
  useFrame((state, delta) => {
    if (!texture) return
    const target = layerShift(pointer(state), [ax, az])
    const k = damping(3, Math.min(delta, 0.1))
    shift.current[0] += (target[0] - shift.current[0]) * k
    shift.current[1] += (target[1] - shift.current[1]) * k
    // Mover el dibujo +d equivale a mover la textura -d (en UV, v crece hacia el fondo).
    texture.offset.set(-shift.current[0] / w, -shift.current[1] / h)
  })

  // En tiras paralelas al lomo, para que la imagen siga la curva de la hoja.
  const strips = useMemo(
    () =>
      printedStrips({ cx, at, width: w, height: h, turned: turn !== 0 }, STRIPS).map((strip) => {
        const geometry = new BufferGeometry()
        geometry.setAttribute('position', new Float32BufferAttribute(strip.positions, 3))
        geometry.setAttribute('uv', new Float32BufferAttribute(strip.uvs, 2))
        geometry.setIndex([0, 2, 1, 0, 3, 2])
        geometry.computeVertexNormals()
        return { along: strip.along, geometry }
      }),
    [cx, at, w, h, turn],
  )
  useEffect(() => () => strips.forEach((strip) => strip.geometry.dispose()), [strips])

  return (
    <>
      {strips.map((strip, i) => (
        <OnPage key={i} side={side} lift={LAYER_GAP * (order + 1)} along={strip.along}>
          <mesh geometry={strip.geometry} material={material} receiveShadow />
        </OnPage>
      ))}
    </>
  )
}
