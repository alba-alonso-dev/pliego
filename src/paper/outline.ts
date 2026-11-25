import { Shape, Path, Vector2 } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

/** Un punto 2D como par [x, y]. */
export type Point = [number, number]

/** El contorno de una pieza de cartulina, con sus agujeros. */
export interface Outline {
  contour: Point[]
  holes: Point[][]
}

export type Anchor = 'bottom' | 'center'

export interface FitOptions {
  /** Ancho final en unidades del mundo. Si se da también `height`, manda `width`. */
  width?: number
  /** Alto final en unidades del mundo. */
  height?: number
  /**
   * Dónde queda el origen: `bottom` = centro del borde inferior (piezas de
   * pie sobre un pliegue); `center` = centro de la pieza.
   */
  anchor?: Anchor
}

/** Puntos por curva al convertir las curvas del SVG en polígonos. */
const CURVE_DIVISIONS = 24

/**
 * Convierte un SVG (el texto del archivo) en contornos.
 * Cada `<path>`, `<rect>`, `<polygon>`… relleno da una o varias piezas.
 */
export function outlinesFromSvg(svg: string): Outline[] {
  const data = new SVGLoader().parse(svg)
  const outlines: Outline[] = []
  for (const path of data.paths) {
    const style = path.userData?.style as { fill?: string } | undefined
    const fill = style?.fill
    if (fill === 'none' || fill === 'transparent') continue
    for (const shape of SVGLoader.createShapes(path)) {
      const { shape: contour, holes } = shape.extractPoints(CURVE_DIVISIONS)
      outlines.push({
        contour: toPoints(contour),
        holes: holes.map(toPoints),
      })
    }
  }
  return outlines
}

function toPoints(vectors: Vector2[]): Point[] {
  const points = vectors.map((v): Point => [v.x, v.y])
  // extractPoints puede repetir el primer punto al final.
  const first = points[0]
  const last = points[points.length - 1]
  if (first && last && points.length > 1 && first[0] === last[0] && first[1] === last[1]) {
    points.pop()
  }
  return points
}

/** Caja que envuelve todos los contornos. */
export function bounds(outlines: Outline[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const { contour } of outlines) {
    for (const [x, y] of contour) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

/**
 * Escala los contornos a unidades del mundo, invierte el eje Y (en SVG
 * crece hacia abajo) y coloca el origen según `anchor`.
 */
export function fitOutlines(outlines: Outline[], options: FitOptions = {}): Outline[] {
  const { anchor = 'bottom' } = options
  const box = bounds(outlines)
  if (!Number.isFinite(box.width) || box.width === 0 || box.height === 0) return []
  const scale =
    options.width !== undefined
      ? options.width / box.width
      : options.height !== undefined
        ? options.height / box.height
        : 1 / Math.max(box.width, box.height)
  const cx = (box.minX + box.maxX) / 2
  const originY = anchor === 'bottom' ? box.maxY : (box.minY + box.maxY) / 2
  const transform = ([x, y]: Point): Point => [(x - cx) * scale, (originY - y) * scale]
  return outlines.map(({ contour, holes }) => ({
    contour: contour.map(transform),
    holes: holes.map((hole) => hole.map(transform)),
  }))
}

/** Convierte un contorno en un `Shape` de Three listo para extruir. */
export function shapeFromOutline({ contour, holes }: Outline): Shape {
  const shape = new Shape(contour.map(([x, y]) => new Vector2(x, y)))
  shape.holes = holes.map((hole) => new Path(hole.map(([x, y]) => new Vector2(x, y))))
  return shape
}
