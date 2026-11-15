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

// Modules the guest pages (landing, sign-in forms, 404) use, kept out of the "app" chunk below
const GUEST_MODULES = /[\\/]src[\\/](App\.jsx|main\.jsx|layout[\\/](PublicLayout|Navbar|AppSpinner|prefetch)|pages[\\/](public|auth)[\\/]|lib[\\/](sessionStore|queryClient|supabase)|services[\\/](auth|session|location)|features[\\/]auth[\\/]hooks[\\/](useAuth|usePasswordRecovery)|components[\\/]ui[\\/](InfoCard|Button|BentoGrid|Logo|BackgroundMesh|Form|AlertBanner|ArrowLink))/

// The signed-in shell (AppLayout, Supabase) and Home's loader are lazy chunks, so guest pages don't load
// them; the router only asks for them once the entry has run. This build-time script in index.html asks
// for them next to the entry when a session is stored (the key lib/sessionStore.js uses).
function preloadAppShell(sessionKey) {
  let base = '/'
  return {
    name: 'preload-app-shell',
    apply: 'build',
    configResolved(config) { base = config.base },
    transformIndexHtml: {
      order: 'post',
      handler(_html, { bundle }) {
        const chunks = Object.values(bundle ?? {}).filter((output) => output.type === 'chunk')
        const byFile = new Map(chunks.map((chunk) => [chunk.fileName, chunk]))
        const entry = chunks.find((chunk) => chunk.isEntry)
        // Guard: the guest entry must not import the signed-in code (a guest module missing from GUEST_MODULES)
        const leaked = entry.imports.filter((file) => /^assets\/(app|supabase)-/.test(file))
        if (leaked.length) this.error(`The entry chunk imports ${leaked.join(', ')}: add the guest module that pulls it in to GUEST_MODULES`)
        const skip = new Set([entry.fileName, ...entry.imports])
        const files = new Set()
        const add = (chunk) => {
          if (!chunk || files.has(chunk.fileName) || skip.has(chunk.fileName)) return
          files.add(chunk.fileName)
          chunk.imports.forEach((file) => add(byFile.get(file)))
        }
        chunks.filter((chunk) => /\/src\/(layout\/AppLayout\.jsx|pages\/app\/browseLoader\.js)$/.test(chunk.facadeModuleId ?? '')).forEach(add)
        const hrefs = JSON.stringify([...files].map((file) => base + file))
        const key = JSON.stringify(sessionKey)
        return [{
          tag: 'script',
          injectTo: 'head',
          children: `try{if(sessionStorage.getItem(${key})??localStorage.getItem(${key}))for(const href of ${hrefs}){const link=document.createElement('link');link.rel='modulepreload';link.crossOrigin='';link.href=href;document.head.append(link)}}catch{}`,
        }]
      },
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_')
  if (command === 'build') assertEnv(env)
  const sessionKey = env.VITE_SUPABASE_URL && `sb-${new URL(env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`

  return {
    plugins: [
      react(),
      tailwindcss(),
      preloadAppShell(sessionKey),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          // Our code shared by two or more signed-in chunks goes into one "app" chunk instead of one tiny
          // chunk per combination of importers. Guest-page code (entry, auth forms, session, the client)
          // is left out, so the sign-in pages never load it.
          codeSplitting: {
            includeDependenciesRecursively: false,
            groups: [{
              name: (id) => (/[\\/]src[\\/].+\.jsx?$/.test(id) && !GUEST_MODULES.test(id) ? 'app' : null),
              minShareCount: 2,
            }],
          },
          // The lazy Supabase clients (src/lib/supabase.js) would be named after their package's
          // build folder ("dist", "module"): name them after the package instead
          chunkFileNames: ({ name, facadeModuleId }) => {
            const pkg = facadeModuleId?.match(/@supabase\/([a-z]+)-js/)?.[1]
            return `assets/${pkg ? `supabase-${pkg}` : name}-[hash].js`
          },
        },
      },
    },
  }
})
