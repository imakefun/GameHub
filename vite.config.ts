import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function communityLevelsApi(): Plugin {
  const filePath = path.resolve(__dirname, 'public/community-levels.json')

  function readLevels(): unknown[] {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
      return []
    }
  }

  function writeLevels(levels: unknown[]) {
    fs.writeFileSync(filePath, JSON.stringify(levels, null, 2) + '\n')
  }

  return {
    name: 'community-levels-api',
    configureServer(server) {
      server.middlewares.use('/api/community-levels', (req, res) => {
        // POST — submit a new level
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            try {
              const level = JSON.parse(body)
              const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
              const submitted = { ...level, id, submittedAt: Date.now() }
              const levels = readLevels()
              levels.push(submitted)
              writeLevels(levels)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(submitted))
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
          return
        }

        // DELETE — remove a level by id (passed as query param)
        if (req.method === 'DELETE') {
          const url = new URL(req.url || '', `http://${req.headers.host}`)
          const id = url.searchParams.get('id')
          if (!id) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Missing id' }))
            return
          }
          const levels = readLevels() as { id?: string }[]
          const filtered = levels.filter(l => l.id !== id)
          writeLevels(filtered)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
          return
        }

        // GET — read all levels
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(readLevels()))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), communityLevelsApi()],
  base: '/GameHub/',
})
