import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CONTENT_FILE = fileURLToPath(new URL('./src/data/section12-content.json', import.meta.url));

// Dev-only API for the /admin content editor (see src/AdminSection12.jsx)
// to read/write the real section12-content.json file on disk. This only
// exists while running `npm run dev` -- there's no server in the built
// production site, so it's not present there at all. The JSON file it
// writes is a normal repo file though: edit via /admin locally, verify,
// then commit + push like any other change to ship it.
function section12ContentApi() {
  return {
    name: 'section12-content-api',
    configureServer(server) {
      server.middlewares.use('/api/section12-content', async (req, res) => {
        if (req.method === 'GET') {
          const json = await readFile(CONTENT_FILE, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(json);
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body);
              await writeFile(CONTENT_FILE, `${JSON.stringify(parsed, null, 2)}\n`, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end('Method not allowed');
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), section12ContentApi()],
});
