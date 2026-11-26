import { Book, Paper, PopUp, Spread } from 'pliego'
import arbol from './shapes/arbol.svg?raw'
import casa from './shapes/casa.svg?raw'
import colina from './shapes/colina.svg?raw'

/**
 * Libro de prueba con la bisagra arriba, como Estratos: las hojas se pasan
 * hacia arriba y se baja una capa cada vez. En los spreads, `x` es la
 * distancia al lomo hacia abajo y `at` recorre el ancho.
 */
export function EstratosBook() {
  return (
    <Book hinge="top" size={[1.4, 0.9]} coverColor="#6b5a4a">
      <Spread id="hoy">
        <PopUp x={0.45} at={0.35}>
          <Paper src={casa} height={0.3} color="#c0614b" />
        </PopUp>
        <PopUp x={0.5} at={-0.3}>
          <Paper src={arbol} height={0.32} color="#5b8e7d" />
        </PopUp>
      </Spread>
      <Spread id="antropoceno">
        <PopUp x={0.4} at={0}>
          <Paper src={colina} width={0.9} color="#8a8178" />
        </PopUp>
      </Spread>
      <Spread id="cretacico">
        <PopUp x={0.45} at={0.2}>
          <Paper src={arbol} height={0.4} color="#6f8f4e" />
        </PopUp>
      </Spread>
      <Spread id="origen">
        <PopUp x={0.4} at={0}>
          <Paper src={colina} width={0.7} color="#3d4a5c" />
        </PopUp>
      </Spread>
    </Book>
  )
}
