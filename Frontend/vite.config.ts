import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig(({ mode }) => ({
  // Bind all interfaces so the dev server is reachable from other devices
  // on the LAN via this machine's IP address.
  server: {
    host: true,
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    ...(mode === 'development' ? [devtools()] : []),
    ...(mode === 'test' ? [] : [nitro()]),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
}))

export default config
