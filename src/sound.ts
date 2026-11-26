import { create } from 'zustand'

/**
 * Sonido opcional del papel, sintetizado con Web Audio a partir de ruido
 * filtrado: no hace falta ningún archivo ni licencia. Está apagado por
 * defecto y se recuerda la preferencia.
 */

const STORAGE_KEY = 'pliego:sound'

export type PaperSound = 'turn' | 'flap' | 'slide'

export interface PaperSoundShape {
  /** Duración en segundos. */
  duration: number
  /** Frecuencia central del filtro (Hz): más alta, papel más fino. */
  frequency: number
  /** Volumen máximo (0–1). */
  gain: number
  /** Golpe grave al final (Hz), o 0 si no lo hay. */
  thump: number
}

/** Cómo suena cada gesto: un susurro largo al pasar la hoja, más corto al mover una pieza. */
export function soundShape(kind: PaperSound): PaperSoundShape {
  switch (kind) {
    case 'turn':
      return { duration: 0.55, frequency: 2600, gain: 0.18, thump: 0 }
    case 'flap':
      return { duration: 0.22, frequency: 1800, gain: 0.16, thump: 140 }
    case 'slide':
      return { duration: 0.3, frequency: 3400, gain: 0.1, thump: 0 }
  }
}

function readStored(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === 'on'
  } catch {
    return false
  }
}

interface SoundState {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
}

export const useSoundStore = create<SoundState>((set) => ({
  enabled: readStored(),
  setEnabled: (enabled) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
    } catch {
      // Se ignora si no se puede guardar.
    }
    if (enabled) audio()?.resume()
    set({ enabled })
  },
}))

let context: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return null
  context ??= new AudioContext()
  return context
}

/** Suena el papel, si el sonido está activado. */
export function playPaper(kind: PaperSound): void {
  if (!useSoundStore.getState().enabled) return
  const ctx = audio()
  if (!ctx || ctx.state !== 'running') return
  const shape = soundShape(kind)
  const now = ctx.currentTime
  const length = Math.ceil(shape.duration * ctx.sampleRate)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1

  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = shape.frequency
  filter.Q.value = 0.8
  const gain = ctx.createGain()
  // Sube deprisa y se apaga despacio, como un roce.
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(shape.gain, now + shape.duration * 0.25)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + shape.duration)
  noise.connect(filter).connect(gain).connect(ctx.destination)
  noise.start(now)
  noise.stop(now + shape.duration)

  if (shape.thump > 0) {
    const osc = ctx.createOscillator()
    const thump = ctx.createGain()
    osc.frequency.setValueAtTime(shape.thump, now + shape.duration * 0.6)
    osc.frequency.exponentialRampToValueAtTime(shape.thump / 2, now + shape.duration)
    thump.gain.setValueAtTime(0.0001, now + shape.duration * 0.6)
    thump.gain.exponentialRampToValueAtTime(0.12, now + shape.duration * 0.65)
    thump.gain.exponentialRampToValueAtTime(0.0001, now + shape.duration)
    osc.connect(thump).connect(ctx.destination)
    osc.start(now + shape.duration * 0.6)
    osc.stop(now + shape.duration)
  }
}
