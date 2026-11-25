import { EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

export interface PaperEffectsProps {
  /** Intensidad de la oclusión ambiental entre capas (0 la desactiva). */
  ambientOcclusion?: number
  /** Oscurecimiento de las esquinas (0 lo desactiva). */
  vignette?: number
}

/**
 * Postprocesado suave: oclusión ambiental para que las capas de cartulina
 * se oscurezcan donde se juntan, antialiasing, una viñeta ligera y un
 * tone mapping que respeta los colores de las cartulinas.
 */
export function PaperEffects({ ambientOcclusion = 1.6, vignette = 0.35 }: PaperEffectsProps) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {ambientOcclusion > 0 ? (
        <N8AO
          aoRadius={0.12}
          distanceFalloff={0.5}
          intensity={ambientOcclusion}
          color="#3b2a1a"
          halfRes
        />
      ) : (
        <></>
      )}
      <SMAA />
      {vignette > 0 ? <Vignette offset={0.32} darkness={vignette} /> : <></>}
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  )
}
