import { Book, Spread } from 'pliego'

/** Una tarjeta de cartulina de pie sobre el spread. */
function Card({
  position,
  size,
  color,
}: {
  position: [number, number]
  size: [number, number]
  color: string
}) {
  const [x, z] = position
  const [w, h] = size
  return (
    <mesh position={[x, h / 2, z]} castShadow receiveShadow>
      <boxGeometry args={[w, h, 0.01]} />
      <meshStandardMaterial color={color} roughness={0.92} />
    </mesh>
  )
}

/** Libro de prueba: cuatro spreads con escenas de cartulinas sencillas. */
export function DemoBook() {
  return (
    <Book coverColor="#b5543c">
      <Spread id="bienvenida">
        <Card position={[-0.5, 0]} size={[0.5, 0.35]} color="#e9c46a" />
        <Card position={[0.5, -0.1]} size={[0.35, 0.5]} color="#8ab17d" />
      </Spread>
      <Spread id="colinas">
        <Card position={[-0.45, 0.2]} size={[0.8, 0.25]} color="#8ab17d" />
        <Card position={[0.45, 0]} size={[0.8, 0.4]} color="#5b8e7d" />
        <Card position={[0.3, -0.25]} size={[0.15, 0.6]} color="#f4ead5" />
      </Spread>
      <Spread id="ciudad">
        <Card position={[-0.6, 0]} size={[0.2, 0.55]} color="#d98e6a" />
        <Card position={[-0.3, 0.1]} size={[0.25, 0.4]} color="#c0614b" />
        <Card position={[0.35, -0.05]} size={[0.3, 0.7]} color="#e9c46a" />
      </Spread>
      <Spread id="final">
        <Card position={[0, 0]} size={[0.9, 0.3]} color="#5b8e7d" />
      </Spread>
    </Book>
  )
}
