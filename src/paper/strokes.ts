import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { fitOutlines, type FitOptions, type Point } from './outline'

/** Un trazo: una línea abierta (o cerrada) de puntos. */
export type Stroke = Point[]

/** Puntos por curva al convertir las curvas del SVG en líneas. */
const CURVE_DIVISIONS = 16

/**
 * Convierte un SVG de trazos (el texto del archivo) en líneas.
 * Cada subtrazo de cada `<path>`, `<line>`, `<polyline>`… da un trazo.
 * Solo se leen los contornos: el grosor y el color los pone <HandDrawn>.
 */
export function strokesFromSvg(svg: string): Stroke[] {
  const data = new SVGLoader().parse(svg)
  const strokes: Stroke[] = []
  for (const path of data.paths) {
    for (const subPath of path.subPaths) {
      const points = dedupe(subPath.getPoints(CURVE_DIVISIONS).map((v): Point => [v.x, v.y]))
      if (points.length > 1) strokes.push(points)
    }
  }
  return strokes
}

/** Quita puntos repetidos seguidos (las curvas comparten extremos). */
function dedupe(points: Point[]): Point[] {
  return points.filter((p, i) => {
    const prev = points[i - 1]
    return !prev || prev[0] !== p[0] || prev[1] !== p[1]
  })
}

/**
 * Escala los trazos a unidades del mundo con el eje Y hacia arriba, igual
 * que `fitOutlines`. Por defecto el origen queda en el centro del dibujo.
 */
export function fitStrokes(strokes: Stroke[], options: FitOptions = {}): Stroke[] {
  const fitted = fitOutlines(
    strokes.map((contour) => ({ contour, holes: [] })),
    { anchor: 'center', ...options },
  )
  return fitted.map((outline) => outline.contour)
}

/**
 * Reparte los puntos de un trazo a intervalos de como mucho `step`, para
 * que el revelado avance a ritmo constante aunque el SVG tenga tramos
 * rectos largos.
 */
export function resample(stroke: Stroke, step: number): Stroke {
  const first = stroke[0]
  if (!first || step <= 0) return stroke
  const out: Stroke = [first]
  for (let i = 1; i < stroke.length; i++) {
    const [ax, ay] = stroke[i - 1]!
    const [bx, by] = stroke[i]!
    const parts = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step))
    for (let k = 1; k <= parts; k++) {
      const t = k / parts
      out.push([ax + (bx - ax) * t, ay + (by - ay) * t])
    }
  }
  return out
}

/** Longitud de un trazo. */
export function strokeLength(stroke: Stroke): number {
  let length = 0
  for (let i = 1; i < stroke.length; i++) {
    const [ax, ay] = stroke[i - 1]!
    const [bx, by] = stroke[i]!
    length += Math.hypot(bx - ax, by - ay)
  }
  return length
}

/** Un SVG, o uno por idioma: `{ es: notaEs, en: notaEn }`. */
export type HandDrawnSource = string | Record<string, string>

/** Elige el SVG del idioma activo; si no lo hay, el primero. */
export function pickSource(src: HandDrawnSource, lang: string | null): string {
  if (typeof src === 'string') return src
  return (lang !== null ? src[lang] : undefined) ?? Object.values(src)[0] ?? ''
}
