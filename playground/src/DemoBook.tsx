import {
  Bob,
  Book,
  FloatingLayer,
  HandDrawn,
  OnPanel,
  Paper,
  ParallelFold,
  PopUp,
  PrintedLayer,
  Spread,
  Sway,
  tentFold,
  Valley,
  VFold,
} from 'pliego'
import arbol from './shapes/arbol.svg?raw'
import casa from './shapes/casa.svg?raw'
import colina from './shapes/colina.svg?raw'
import molino from './shapes/molino.svg?raw'
import nube from './shapes/nube.svg?raw'
import flecha from './trazos/flecha.svg?raw'
import pajaros from './trazos/pajaros.svg?raw'
import sol from './trazos/sol.svg?raw'
import { MovablesScene } from './MovablesSpread'
import { SunScene } from './SunSpread'
import cielo from './impresas/cielo.svg?url'
import cieloIzq from './impresas/cielo-izq.svg?url'
import lejos from './impresas/lejos.svg?url'

/**
 * Libro de prueba: spreads con piezas pop-up de cartulina, movibles y
 * mecanismos de papel.
 * `at` es la profundidad de la línea de pliegue (negativo = fondo) y `x`
 * la posición a lo ancho (el lomo está en x = 0).
 */
export function DemoBook() {
  return (
    <Book coverColor="#b5543c">
      <Spread id="bienvenida">
        <PopUp at={-0.3} x={0.6}>
          <Bob>
            <Paper src={nube} width={0.3} position={[0, 0.35, 0]} color="#fbf7ee" />
          </Bob>
        </PopUp>
        <PopUp at={-0.1} x={-0.5}>
          <Paper src={colina} width={0.9} color="#8ab17d" />
        </PopUp>
        <PopUp at={0.1} x={0.45}>
          <Sway>
            <Paper src={arbol} height={0.45} color="#5b8e7d" />
          </Sway>
        </PopUp>
        <HandDrawn src={pajaros} x={-0.55} at={-0.45} width={0.3} reveal />
        <HandDrawn src={flecha} x={-0.3} at={0.38} width={0.32} reveal={{ delay: 1 }} />
      </Spread>

      <Spread id="colinas">
        <HandDrawn src={sol} x={-0.78} at={-0.52} width={0.2} reveal />
        <PopUp at={-0.4} x={0.3}>
          <Paper src={molino} height={0.7} color="#fbf7ee" />
        </PopUp>
        <PopUp at={-0.25} x={-0.5}>
          <Paper src={colina} width={0.95} color="#5b8e7d" />
        </PopUp>
        <PopUp at={0} x={0.45}>
          <Paper src={colina} width={0.8} color="#8ab17d" />
        </PopUp>
        <PopUp at={0.25} x={-0.3} angle={80}>
          <Paper src={arbol} height={0.3} color="#3f6f5e" />
        </PopUp>
      </Spread>

      <Spread id="ciudad">
        <PopUp at={-0.2} x={-0.25}>
          <Paper src={casa} height={0.6} color="#c0614b" />
        </PopUp>
        <PopUp at={0} x={-0.6}>
          <Paper src={casa} height={0.45} color="#d98e6a" />
        </PopUp>
        <PopUp at={0.05} x={0.4}>
          <Paper src={casa} height={0.5} color="#e9c46a" />
        </PopUp>
        <PopUp at={0.25} x={0.75} angle={75}>
          <Paper src={arbol} height={0.35} color="#5b8e7d" />
        </PopUp>
      </Spread>

      <Spread id="sol">
        {/* Arrastra el sol hacia arriba: los árboles crecen y reverdecen. */}
        <SunScene />
      </Spread>

      <Spread id="movibles">
        <MovablesScene />
      </Spread>

      <Spread id="mecanismos">
        {/* Mecanismos de papel de verdad: su forma la impone la apertura del libro. */}
        <ParallelFold {...tentFold(0.14, 0.24)} at={-0.42} width={0.3} color="#c0614b" />
        <VFold at={0.62} glueAngle={30} pieceAngle={75} base={0.28} height={0.3} color="#5b8e7d">
          {/* Capas: una V pequeña en el valle de la grande y una nube que gira con un panel. */}
          <Valley side="right">
            <VFold glueAngle={25} pieceAngle={80} base={0.16} height={0.18} color="#8ab17d" />
          </Valley>
          <OnPanel side="left">
            <Paper
              src={nube}
              width={0.16}
              anchor="center"
              position={[0.16, 0.12, -0.006]}
              color="#fbf7ee"
            />
          </OnPanel>
        </VFold>
        <FloatingLayer distance={0.3} height={0.1} at={0.03} width={0.32} color="#e9c46a">
          <ParallelFold {...tentFold(0.08, 0.13)} width={0.22} color="#d98e6a" />
        </FloatingLayer>
      </Spread>

      <Spread id="final">
        <PrintedLayer src={cieloIzq} side="left" />
        <PrintedLayer src={cielo} side="right" />
        <PrintedLayer src={lejos} side="left" order={1} parallax={0.02} />
        <PrintedLayer src={lejos} side="right" order={1} parallax={0.02} />
        <PopUp at={-0.2} x={-0.3}>
          <Paper src={nube} width={0.35} position={[0, 0.4, 0]} color="#fbf7ee" />
        </PopUp>
        <PopUp at={0}>
          <Paper src={colina} width={1.2} color="#5b8e7d" />
        </PopUp>
      </Spread>
    </Book>
  )
}
