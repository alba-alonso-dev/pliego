import { useFrame } from '@react-three/fiber'
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react'
import type { Group } from 'three'
import type { Thicknesses } from '../math/book'
import { paperMaterials } from '../materials/paper'
import { clamp } from '../math/easing'
import { useBookStore } from '../store'
import { animateTo } from '../turn'
import { BookContext, SpreadIndexContext, type BookContextValue } from './context'
import { Cover } from './Cover'
import { Leaf } from './Leaf'
import type { SpreadProps } from './Spread'
import { useBookNavigation, type NavigationOptions } from './useBookNavigation'

export interface BookProps extends NavigationOptions {
  /**
   * Dónde está la bisagra: `left` (un libro) o `top` (un bloc o un
   * calendario de pared: las hojas se pasan hacia arriba). Con `top`, en
   * los spreads la página «derecha» es la de abajo, `x` es la distancia
   * al lomo hacia abajo y `at` recorre el ancho de derecha a izquierda.
   */
  hinge?: 'left' | 'top'
  /** Ancho y alto de una página, tal como se ven en pantalla. */
  size?: [number, number]
  /** Grosor de las tapas y de cada página. */
  thickness?: Partial<Thicknesses>
  coverColor?: string
  pageColor?: string
  edgeColor?: string
  /**
   * Lo que va pegado sobre la tapa, por fuera: gira con ella al abrir el
   * libro. Usa las coordenadas de un spread (el lomo en x = 0, la tapa de
   * x = 0 a x = ancho).
   */
  cover?: ReactNode
  /** Hijos <Spread>, uno por doble página. */
  children?: ReactNode
}

function spreadsOf(children: ReactNode): ReactElement<SpreadProps>[] {
  return Children.toArray(children).filter(
    (child): child is ReactElement<SpreadProps> =>
      isValidElement<SpreadProps>(child) && typeof child.props.id === 'string',
  )
}

/**
 * Libro con tapas, lomo y bloque de hojas, tumbado sobre la mesa con la
 * bisagra a la izquierda. Cerrado se centra en pantalla; al abrirse, el
 * lomo queda en el centro.
 */
export function Book({
  hinge = 'left',
  size: screenSize = [1, 1.4],
  thickness: thicknessProp,
  coverColor = '#b5543c',
  pageColor = '#f7f1e3',
  edgeColor = '#e8dcc2',
  cover,
  children,
  keyboard = true,
  hash = true,
  drag = true,
}: BookProps) {
  const spreads = spreadsOf(children)
  const ids = spreads.map((spread) => spread.props.id)
  const idsKey = ids.join('|')
  const count = spreads.length
  // El libro se construye siempre con la bisagra a la izquierda; con la
  // bisagra arriba se gira entero, así que el ancho y el alto se cruzan.
  const size: [number, number] =
    hinge === 'top' ? [screenSize[1], screenSize[0]] : [screenSize[0], screenSize[1]]
  const [width, height] = size

  // Grosor y color de canto propios de cada hoja: los de su spread (la
  // hoja k se pasa para salir del spread k - 1). Su cara de delante es la
  // página derecha de ese spread y la de atrás, la izquierda del spread k.
  const layerKey = spreads
    .map((s) => `${s.props.thickness ?? ''}:${s.props.edgeColor ?? ''}:${s.props.pageColor ?? ''}`)
    .join('|')
  const layers = useMemo(
    () =>
      spreads.map((spread, k) => {
        const props = k > 0 ? spreads[k - 1]!.props : undefined
        return {
          thickness: props?.thickness,
          edge: props?.edgeColor,
          front: props?.pageColor,
          back: spread.props.pageColor,
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layerKey],
  )
  const thickness = useMemo<Thicknesses>(
    () => ({
      cover: thicknessProp?.cover ?? 0.03,
      page: thicknessProp?.page ?? 0.006,
      pages: layers.map((layer) => layer.thickness),
    }),
    [thicknessProp?.cover, thicknessProp?.page, layers],
  )
  const context = useMemo<BookContextValue>(
    () => ({ size, thickness, count }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height, thickness, count],
  )

  // Registrar los spreads en el store.
  useEffect(() => {
    useBookStore.getState().setIds(idsKey ? idsKey.split('|') : [])
  }, [idsKey])

  // Animar las hojas cada vez que cambia la página de destino.
  useEffect(
    () =>
      useBookStore.subscribe((state, previous) => {
        if (state.current !== previous.current) animateTo(state.current)
      }),
    [],
  )

  useEffect(() => {
    useBookStore.getState().setHinge(hinge)
  }, [hinge])

  // Tamaño del libro abierto sobre la mesa (ancho en pantalla, fondo), para la cámara.
  useEffect(() => {
    useBookStore
      .getState()
      .setFootprint(hinge === 'top' ? [height, width * 2] : [width * 2, height])
  }, [hinge, width, height])

  useBookNavigation({ keyboard, hash, drag, hinge })

  // Contratapa: por dentro lleva pegada una guarda del color del papel,
  // como la tapa; los cantos y la base son de tapa.
  // Orden de materiales de BoxGeometry: +x, -x, +y, -y, +z, -z.
  // En el último spread, su página derecha es esta guarda.
  const lastPage = layers[count - 1]?.back ?? pageColor
  const backCover = useMemo(() => {
    const cover = paperMaterials(coverColor).face
    return [cover, cover, paperMaterials(lastPage).face, cover, cover, cover]
  }, [coverColor, lastPage])

  // Cerrado, el libro se desplaza para quedar centrado.
  const body = useRef<Group>(null)
  useFrame(() => {
    if (!body.current) return
    const opened = clamp(useBookStore.getState().position)
    body.current.position.x = (-width / 2) * (1 - opened)
  })

  return (
    <BookContext.Provider value={context}>
      {/* Bisagra arriba: el mismo libro girado para que las hojas se pasen hacia el fondo. */}
      <group rotation={[0, hinge === 'top' ? -Math.PI / 2 : 0, 0]}>
        <group ref={body}>
          {/* Contratapa: la base fija bajo la pila de la derecha. */}
          <mesh
            position={[width / 2, thickness.cover / 2, 0]}
            material={backCover}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[width, thickness.cover, height]} />
          </mesh>

          {spreads.map((spread, i) => (
            <Leaf
              key={spread.props.id}
              index={i}
              front={i === 0 ? coverColor : (layers[i]?.front ?? pageColor)}
              back={layers[i]?.back ?? pageColor}
              edge={i === 0 ? coverColor : (layers[i]?.edge ?? edgeColor)}
              curl={i !== 0}
            />
          ))}

          {cover !== undefined && count > 0 && <Cover>{cover}</Cover>}

          {spreads.map((spread, i) => (
            <SpreadIndexContext.Provider key={spread.props.id} value={i}>
              {spread}
            </SpreadIndexContext.Provider>
          ))}
        </group>
      </group>
    </BookContext.Provider>
  )
}
