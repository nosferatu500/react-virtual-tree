import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts(
      {
        include: ['src/**/*.{ts,tsx}'],
        rollupTypes: true,
        tsconfigPath: './tsconfig.app.json',
      }
    )
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: "react-virtual-tree.js"
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dnd', 'react-dnd-html5-backend', 'virtua'],
      output: {intro: 'import "./style.css";'}
    },
  },
})
