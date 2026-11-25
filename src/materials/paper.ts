import {
  Color,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  RGBAFormat,
  Vector2,
} from 'three'
import { grainHeights, heightsToNormalMap } from './grain'

const GRAIN_SIZE = 256
/** Repeticiones del grano por unidad del mundo (una página mide ~1). */
const GRAIN_REPEAT = 5

let grain: DataTexture | null = null

/** Textura de grano compartida por todas las cartulinas, creada una vez. */
export function paperGrain(): DataTexture {
  if (grain) return grain
  const normals = heightsToNormalMap(grainHeights(GRAIN_SIZE, 20260), GRAIN_SIZE)
  grain = new DataTexture(normals, GRAIN_SIZE, GRAIN_SIZE, RGBAFormat)
  grain.wrapS = RepeatWrapping
  grain.wrapT = RepeatWrapping
  grain.repeat.set(GRAIN_REPEAT, GRAIN_REPEAT)
  grain.magFilter = LinearFilter
  grain.minFilter = LinearMipmapLinearFilter
  grain.generateMipmaps = true
  grain.colorSpace = NoColorSpace
  grain.anisotropy = 4
  grain.needsUpdate = true
  return grain
}

export interface PaperMaterials {
  /** Caras de la cartulina, con grano. */
  face: MeshStandardMaterial
  /** Cantos, algo más oscuros para que se lea el grosor. */
  edge: MeshStandardMaterial
}

/** Cuánto se oscurecen los cantos respecto a la cara. */
export const EDGE_SHADE = 0.78

const cache = new Map<string, PaperMaterials>()

/**
 * Materiales de papel para un color. Se comparten entre todas las piezas
 * del mismo color: así hay pocos materiales distintos y se dibuja rápido.
 */
export function paperMaterials(color: string): PaperMaterials {
  const cached = cache.get(color)
  if (cached) return cached
  const base = new Color(color)
  const materials: PaperMaterials = {
    face: new MeshStandardMaterial({
      color: base,
      roughness: 0.92,
      metalness: 0,
      normalMap: paperGrain(),
      normalScale: new Vector2(0.5, 0.5),
    }),
    edge: new MeshStandardMaterial({
      color: base.clone().multiplyScalar(EDGE_SHADE),
      roughness: 1,
      metalness: 0,
    }),
  }
  cache.set(color, materials)
  return materials
}
