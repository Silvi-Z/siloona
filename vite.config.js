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

// Link previews (WhatsApp, Telegram, Instagram, Facebook) read the page's
// <meta> tags without running any JavaScript. So the build writes a copy
// of index.html for each other language — dist/ru/index.html and
// dist/en/index.html — with its own title, description, preview image and
// locale; vercel.json serves them for /ru/… and /en/….
const SITE = 'https://siloona.am'
const HTML_LANGS = {
  ru: {
    title: 'Siloona — цифровые приглашения',
    description: 'Красивые и персональные цифровые приглашения на свадьбу, день рождения, крестины и другие важные моменты вашей жизни.',
    og: 'Красивые и персональные цифровые приглашения для важных моментов вашей жизни.',
    locale: 'ru_RU',
  },
  en: {
    title: 'Siloona — digital invitations',
    description: 'Beautiful, personal digital invitations for weddings, birthdays, christenings and the other meaningful moments of your life.',
    og: 'Beautiful, personal digital invitations for the meaningful moments of your life.',
    locale: 'en_US',
  },
}

function localizedHtml() {
  let outDir
  return {
    name: 'siloona-localized-html',
    apply: 'build',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir) },
    closeBundle() {
      const base = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      const attr = (html, sel, value) => html.replace(new RegExp(`(<meta ${sel} content=")[^"]*(")`, 'g'), `$1${value}$2`)
      for (const [lang, t] of Object.entries(HTML_LANGS)) {
        let html = base
          .replace('<html lang="hy">', `<html lang="${lang}">`)
          .replace(/<title>[^<]*<\/title>/, `<title>${t.title}</title>`)
        html = attr(html, 'name="description"', t.description)
        html = attr(html, 'property="og:title"', t.title)
        html = attr(html, 'name="twitter:title"', t.title)
        html = attr(html, 'property="og:image:alt"', t.title)
        html = attr(html, 'property="og:description"', t.og)
        html = attr(html, 'name="twitter:description"', t.og)
        html = attr(html, 'property="og:url"', `${SITE}/${lang}/`)
        html = attr(html, 'property="og:image"', `${SITE}/og-${lang}.png`)
        html = attr(html, 'name="twitter:image"', `${SITE}/og-${lang}.png`)
        html = attr(html, 'property="og:locale"', t.locale)
        // the alternates: every locale but this page's own
        html = html.replace(/\s*<meta property="og:locale:alternate"[^>]*>/g, '')
        const alts = ['hy_AM', 'ru_RU', 'en_US'].filter((l) => l !== t.locale)
          .map((l) => `\n    <meta property="og:locale:alternate" content="${l}" />`).join('')
        html = html.replace(/(<meta property="og:locale" content="[^"]*" \/>)/, `$1${alts}`)
        fs.mkdirSync(path.join(outDir, lang), { recursive: true })
        fs.writeFileSync(path.join(outDir, lang, 'index.html'), html)
      }
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
    plugins: [react(), devApi(), localizedHtml()],
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  }
})
