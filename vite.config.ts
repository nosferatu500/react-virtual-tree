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
        include: ["src/VTree.tsx", "src/TreeNode.tsx", "src/utils.ts"],
        rollupTypes: true,
        tsconfigPath: './tsconfig.app.json',
        outDir: 'dist/types',
      }
    )
  ],
  build: {
    lib: {
      name: "react-virtual-tree.js",
      entry: [resolve(__dirname, 'src/VTree.tsx'), resolve(__dirname, 'src/utils.ts')],
      formats: ['es'],
      fileName: (_, entryName) => "VTree" === entryName ? 'react-virtual-tree.js' : "utils.js"
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dnd', 'react-dnd-html5-backend', 'virtua'],
      output: {
        intro: (chunk) => (chunk.name === 'VTree' ? 'import "./style.css";' : '')
      }
    },
  },
})
