import { useFrame } from '@react-three/fiber'
import { lerp, Paper, paperMaterials, PopUp, useGesture } from 'pliego'
import { useRef } from 'react'
import { Color, type Group } from 'three'
import arbol from './shapes/arbol.svg?raw'
import colina from './shapes/colina.svg?raw'
import sol from './shapes/sol.svg?raw'

/** Color propio de los árboles de esta escena: su material se tiñe con el sol. */
const TREE = '#5b8e7f'
const GREY = new Color('#a3a69f')
const GREEN = new Color(TREE)

const TREES: [number, number, number][] = [
  // [x, profundidad, alto]
  [-0.7, 0.1, 0.3],
  [-0.35, 0.25, 0.38],
  [0.3, 0.2, 0.34],
  [0.65, 0.05, 0.42],
]

/**
 * «Arrastra el sol»: al subir el sol, los árboles crecen y pasan del gris
 * al verde. Muestra cómo usar `useGesture()` para animar una escena.
 */
export function SunScene() {
  const sun = useGesture({ mode: 'drag', axis: 'y', distance: 180, initial: 0.15 })
  const sunGroup = useRef<Group>(null)
  const trees = useRef<(Group | null)[]>([])

  useFrame(() => {
    const p = sun.progress()
    if (sunGroup.current) sunGroup.current.position.y = lerp(0.12, 0.45, p)
    trees.current.forEach((tree, i) => {
      // Cada árbol empieza a crecer un poco después que el anterior.
      const grow = Math.min(1, Math.max(0, (p - i * 0.12) / 0.6))
      tree?.scale.setScalar(lerp(0.35, 1, grow))
    })
    paperMaterials(TREE).face.color.copy(GREY).lerp(GREEN, p)
  })

  return (
    <>
      <PopUp at={-0.5} x={0.05} side="right">
        <group ref={sunGroup} {...sun.bind}>
          <Paper src={sol} width={0.22} anchor="center" color="#f2b45a" />
        </group>
      </PopUp>
      <PopUp at={-0.3} x={-0.45}>
        <Paper src={colina} width={0.9} color="#c9c2a8" />
      </PopUp>
      {TREES.map(([x, at, height], i) => (
        <PopUp key={i} at={at} x={x}>
          <group
            ref={(group) => {
              trees.current[i] = group
            }}
          >
            <Paper src={arbol} height={height} color={TREE} />
          </group>
        </PopUp>
      ))}
    </>
  )
}
