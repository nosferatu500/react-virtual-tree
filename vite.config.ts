import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ include: ["src/VTree.tsx", "src/TreeNode.tsx"], rollupTypes: true, tsconfigPath: './tsconfig.app.json' })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/VTree.tsx'),
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dnd', 'react-dnd-html5-backend', 'virtua'],
    },
  },
})
