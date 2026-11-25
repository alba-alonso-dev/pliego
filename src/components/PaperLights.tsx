import { ContactShadows } from '@react-three/drei'

type Vec3 = [number, number, number]

export interface PaperLightsProps {
  /** Posición de la luz principal (el «sol» de la mesa). */
  position?: Vec3
  /** Intensidad de la luz principal. */
  intensity?: number
  /** Color de la luz principal: cálido por defecto, como luz de mañana. */
  color?: string
  /** Suavidad del borde de las sombras, en texels del mapa de sombras. */
  softness?: number
  /** Opacidad de la sombra de contacto bajo el libro (0 = sin sombra). */
  contactShadow?: number
}

/** Medio lado del área que cubre la sombra: un libro abierto con margen. */
const SHADOW_EXTENT = 1.8

/**
 * Iluminación de la mesa: una sola luz direccional con sombra suave (la
 * que separa las capas del pop-up), luz de cielo y suelo para rellenar las
 * caras en sombra, y una sombra de contacto difusa bajo el libro.
 */
export function PaperLights({
  position = [1.2, 3.2, 2.2],
  intensity = 2.4,
  color = '#fff1dc',
  softness = 4,
  contactShadow = 0.4,
}: PaperLightsProps) {
  return (
    <>
      <hemisphereLight args={['#fffaf0', '#cdbfa6', 0.9]} />
      <directionalLight
        position={position}
        intensity={intensity}
        color={color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={softness}
        shadow-bias={-0.0002}
        // Las cartulinas son muy finas: el normalBias evita el «acné» de sombra.
        shadow-normalBias={0.004}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
      />
      {contactShadow > 0 && (
        <ContactShadows
          position={[0, -0.001, 0]}
          opacity={contactShadow}
          blur={2.4}
          scale={6}
          far={1.5}
        />
      )}
    </>
  )
}
