import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

// Compilación de la librería: dist/index.js (ESM) + tipos.
// Las dependencias de React y Three no se empaquetan: las aporta cada libro.
const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/postprocessing',
  'postprocessing',
  '@use-gesture/react',
  'gsap',
  'zustand',
]

export default defineConfig({
  plugins: [react(), dts({ tsconfigPath: './tsconfig.lib.json' })],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
    },
    rolldownOptions: {
      external: (id) => external.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
