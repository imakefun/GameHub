import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {
  initDatabase,
  getAllLevels,
  insertLevel,
  deleteLevel,
  hashIp,
  checkRateLimit,
  closeDatabase,
} from './server/database'
import { validateLevel, isValidLevelId } from './server/levelValidation'

function communityLevelsApi(): Plugin {
  let dbInitialized = false;

  return {
    name: 'community-levels-api',
    configureServer(server) {
      // Initialize database when server starts
      try {
        initDatabase();
        dbInitialized = true;
        console.log('[community-levels-api] Database initialized successfully');
      } catch (err) {
        console.error('[community-levels-api] Failed to initialize database:', err);
      }

      // Return middleware function to run BEFORE Vite's internal middleware
      return () => {
        server.middlewares.use((req, res, next) => {
          // Only handle /api/community-levels requests
          if (!req.url?.startsWith('/api/community-levels')) {
            return next();
          }

          console.log('[community-levels-api] Handling request:', req.method, req.url);

          // Check if database is ready
          if (!dbInitialized) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database not ready' }));
            return;
          }

          // Get client IP for rate limiting
        const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] ||
                   req.socket.remoteAddress ||
                   'unknown';
        const ipHash = hashIp(ip);

        // CORS headers for development
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        // POST — submit a new level
        if (req.method === 'POST') {
          console.log('[community-levels-api] POST request received');

          // Check rate limit
          if (!checkRateLimit(ipHash, 5)) {
            console.log('[community-levels-api] Rate limit exceeded for', ipHash);
            res.writeHead(429, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Rate limit exceeded',
              message: 'You can only submit 5 levels per hour. Please try again later.',
            }));
            return;
          }

          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString() });
          req.on('end', () => {
            console.log('[community-levels-api] Body received, length:', body.length);
            try {
              // Parse JSON
              let levelData: unknown;
              try {
                levelData = JSON.parse(body);
              } catch (parseErr) {
                console.error('[community-levels-api] JSON parse error:', parseErr);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
                return;
              }

              // Validate and sanitize the level
              console.log('[community-levels-api] Validating level...');
              const validation = validateLevel(levelData);
              if (!validation.valid || !validation.sanitized) {
                console.log('[community-levels-api] Validation failed:', validation.errors);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  error: 'Validation failed',
                  details: validation.errors,
                }));
                return;
              }

              console.log('[community-levels-api] Validation passed');

              // Generate unique ID
              const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

              // Create the submitted level
              const submittedLevel = {
                ...validation.sanitized,
                id,
                submittedAt: Date.now(),
              };

              // Insert into database
              console.log('[community-levels-api] Inserting into database...');
              const saved = insertLevel(submittedLevel, ipHash);
              console.log('[community-levels-api] Level saved with id:', saved.id);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(saved));
            } catch (err) {
              console.error('[community-levels-api] Error submitting level:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal server error' }));
            }
          });

          req.on('error', (err) => {
            console.error('[community-levels-api] Request error:', err);
          });

          return;
        }

        // DELETE — remove a level by id (passed as query param)
        if (req.method === 'DELETE') {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const id = url.searchParams.get('id');

          if (!id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing id parameter' }));
            return;
          }

          // Validate ID format to prevent injection
          if (!isValidLevelId(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid id format' }));
            return;
          }

          const deleted = deleteLevel(id);
          if (deleted) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Level not found' }));
          }
          return;
        }

        // GET — read all levels
        try {
          const levels = getAllLevels();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(levels));
        } catch (err) {
          console.error('Error fetching levels:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        });

        // Close database on server close
        server.httpServer?.on('close', () => {
          closeDatabase();
        });
      };
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), communityLevelsApi()],
  base: '/GameHub/',
})
