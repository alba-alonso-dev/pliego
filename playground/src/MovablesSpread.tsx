import { Flap, Linked, Paper, PullTab, Volvelle } from 'pliego'
import arbol from './shapes/arbol.svg?raw'
import casa from './shapes/casa.svg?raw'
import nube from './shapes/nube.svg?raw'
import sol from './shapes/sol.svg?raw'

/** Piezas tumbadas sobre el papel: los movibles son planos, como en un libro. */
const flat = [-Math.PI / 2, 0, 0] as const

/**
 * Movibles: una lengüeta que hace salir el sol y luego una nube, una rueda
 * con las estaciones vista por una ventana y una solapa que esconde una casa.
 */
export function MovablesScene() {
  return (
    <>
      <PullTab side="right" at={0.35} label="Tira para que salga el sol">
        <Linked from={[0.55, 0, 0.45]} to={[0.55, 0, -0.35]}>
          <Paper src={sol} width={0.18} anchor="center" rotation={flat} color="#f2b45a" />
        </Linked>
        <Linked from={[0.25, 0, 0.5]} to={[0.25, 0, -0.15]} delay={0.4}>
          <Paper src={nube} width={0.2} anchor="center" rotation={flat} color="#fbf7ee" />
        </Linked>
      </PullTab>

      <Volvelle side="left" x={-0.5} at={-0.2} radius={0.26} label="Gira la rueda" cover="#efe3c8">
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <Paper
              src={i % 2 ? nube : arbol}
              width={0.1}
              anchor="center"
              rotation={flat}
              position={[0, 0, -0.16]}
              color={['#5b8e7d', '#fbf7ee', '#c0614b', '#8ab17d'][i]}
            />
          </group>
        ))}
      </Volvelle>

      <Flap
        side="left"
        x={-0.5}
        at={0.4}
        width={0.32}
        height={0.28}
        label="Levanta la solapa"
        color="#d98e6a"
      />
      <group position={[-0.5, 0.0015, 0.4]}>
        <Paper
          src={casa}
          width={0.14}
          depth={0.002}
          anchor="center"
          rotation={flat}
          color="#5b8e7d"
        />
      </group>
    </>
  )
}
