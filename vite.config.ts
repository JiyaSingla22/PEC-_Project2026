import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fetchHandler from './api/fetch';
import discoveryHandler from './api/discovery';

// Helper to buffer request body for POST/PUT/DELETE
function readRequestBody(req: any): Promise<{ raw: string; body: any }> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      let parsed = {};
      try {
        parsed = JSON.parse(data);
      } catch {
        parsed = data;
      }
      resolve({ raw: data, body: parsed });
    });
    req.on('error', () => {
      resolve({ raw: '', body: {} });
    });
  });
}

function decorateResponse(res: any) {
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };
  res.send = (body: any) => {
    res.end(body);
  };
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'incogniread-ps003-api-middleware',
      configureServer(server) {
        // Universal API middleware for PS-003 Small Web Reader
        server.middlewares.use(async (req: any, res: any, next: any) => {
          const url = req.url || '';

          if (!url.startsWith('/api/')) {
            return next();
          }

          decorateResponse(res);

          const urlObj = new URL(url, `http://${req.headers.host || 'localhost'}`);
          req.query = Object.fromEntries(urlObj.searchParams.entries());

          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
            const { raw, body } = await readRequestBody(req);
            req.rawBody = raw;
            req.body = body;
          }

          try {
            if (url.startsWith('/api/fetch')) {
              await fetchHandler(req, res);
            } else if (url.startsWith('/api/discovery')) {
              await discoveryHandler(req, res);
            } else {
              res.status(404).json({ error: 'Endpoint not found' });
            }
          } catch (err: any) {
            console.error('[API Middleware Error]:', err);
            if (!res.writableEnded) {
              res.status(500).json({ error: 'Internal Server Error', details: err?.message });
            }
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
    open: false,
  },
});
