import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// On Vercel every file in /api is a serverless function. This serves the
// same files from `npm run dev`, so checkout and payments work locally
// without the Vercel CLI. Files and folders starting with "_" are helpers,
// never endpoints (same rule as Vercel).
function devApi() {
  return {
    name: 'siloona-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url.split('?')[0].replace(/\/+$/, '')
        if (!urlPath.startsWith('/api/') || urlPath.includes('/_') || urlPath.includes('..')) return next()
        for (const rel of [`${urlPath}.js`, `${urlPath}/index.js`]) {
          if (!fs.existsSync(path.join(server.config.root, rel))) continue
          try {
            const mod = await server.ssrLoadModule(rel)
            return await mod.default(req, res)
          } catch (e) {
            server.ssrFixStacktrace(e)
            console.error(e)
            res.statusCode = 500
            return res.end('API error')
          }
        }
        res.statusCode = 404
        res.end('Not found')
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Server-only variables from .env.local (SUPABASE_SERVICE_ROLE_KEY,
  // ARCA_*, IDRAM_*) for the dev API above. They are NOT exposed to the
  // browser bundle — only VITE_-prefixed variables ever are.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v

  return {
    plugins: [react(), devApi()],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  }
})
