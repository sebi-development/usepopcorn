import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

// Every variable in .env.example is required: a build without one ships an app that fails at runtime
function assertEnv(env) {
  const names = readFileSync(new URL('./.env.example', import.meta.url), 'utf8').match(/^VITE_\w+(?==)/gm) ?? []
  const missing = names.filter((name) => !env[name]?.trim())
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}. On Vercel add them under Settings → Environment Variables, then redeploy.`)
  }
}

export default defineConfig(({ command, mode }) => {
  if (command === 'build') assertEnv(loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_'))

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
