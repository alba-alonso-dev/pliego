import { Book, Paper, PopUp, Spread } from 'pliego'
import arbol from './shapes/arbol.svg?raw'
import casa from './shapes/casa.svg?raw'
import colina from './shapes/colina.svg?raw'
import molino from './shapes/molino.svg?raw'
import nube from './shapes/nube.svg?raw'

/**
 * Libro de prueba: cuatro spreads con piezas pop-up de cartulina.
 * `at` es la profundidad de la línea de pliegue (negativo = fondo) y `x`
 * la posición a lo ancho (el lomo está en x = 0).
 */
export function DemoBook() {
  return (
    <Book coverColor="#b5543c">
      <Spread id="bienvenida">
        <PopUp at={-0.3} x={0.6}>
          <Paper src={nube} width={0.3} position={[0, 0.35, 0]} color="#fbf7ee" />
        </PopUp>
        <PopUp at={-0.1} x={-0.5}>
          <Paper src={colina} width={0.9} color="#8ab17d" />
        </PopUp>
        <PopUp at={0.1} x={0.45}>
          <Paper src={arbol} height={0.45} color="#5b8e7d" />
        </PopUp>
      </Spread>

      <Spread id="colinas">
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

      <Spread id="final">
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
