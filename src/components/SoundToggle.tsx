import { useSoundStore } from '../sound'

export interface SoundToggleProps {
  className?: string
  /** Textos del botón: activar y desactivar. */
  labels?: { on: string; off: string }
}

/**
 * Botón para activar o quitar el sonido del papel. Está apagado por
 * defecto; el navegador solo deja sonar después de una interacción, y este
 * botón lo es.
 */
export function SoundToggle({
  className = 'pliego-sound',
  labels = { on: 'Activar sonido', off: 'Quitar sonido' },
}: SoundToggleProps) {
  const enabled = useSoundStore((state) => state.enabled)
  const setEnabled = useSoundStore((state) => state.setEnabled)
  return (
    <button
      type="button"
      className={className}
      aria-pressed={enabled}
      onClick={() => setEnabled(!enabled)}
    >
      <span aria-hidden="true">{enabled ? '🔊' : '🔈'}</span> {enabled ? labels.off : labels.on}
    </button>
  )
}
