import { useBookStore } from '../store'

/**
 * Giro (radianes, sobre el eje vertical) para que una pieza mire a quien
 * lee. Con la bisagra a la izquierda las piezas miran a lo largo del lomo;
 * con la bisagra arriba, el lector está «debajo» de la página, así que se
 * giran un cuarto de vuelta y se pliegan hacia el lomo.
 */
export function useReaderTurn(): number {
  return useBookStore((state) => state.hinge) === 'top' ? Math.PI / 2 : 0
}
