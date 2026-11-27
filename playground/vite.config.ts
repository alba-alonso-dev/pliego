import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Playground y demo pública. Importa `pliego` directamente desde src/
// para ver los cambios del motor al instante.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/pliego/',
  plugins: [react()],
  resolve: {
    alias: {
      pliego: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('../dist-playground', import.meta.url)),
    emptyOutDir: true,
    // Three.js ocupa ~1 MB sin comprimir (~300 KB con gzip); es lo esperado.
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        // Las dependencias 3D cambian poco: van en archivos aparte para que el
        // navegador las guarde aunque cambie el libro.
        // (El punto acepta tanto `/` como `\` en las rutas).
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules.three./, priority: 3 },
            {
              name: 'r3f',
              test: /node_modules.(@react-three|postprocessing|three-stdlib|n8ao)./,
              priority: 2,
            },
            { name: 'vendor', test: /node_modules./, priority: 1 },
          ],
        },
      },
    },
  },
})
