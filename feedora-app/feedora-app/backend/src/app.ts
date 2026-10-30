import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { connectDB } from './db';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFound } from './middleware/errorHandler';

import feedRoutes from './routes/feeds';
import articleRoutes from './routes/articles';
import fetchRoute from './routes/fetch';
import discoveryRoute from './routes/discovery';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman in dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── Global Rate Limiting ───────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'feedora-backend', timestamp: new Date().toISOString() });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/feeds', feedRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/fetch', fetchRoute);
app.use('/api/discovery', discoveryRoute);

// ─── 404 & Error Handling ───────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] Feedora backend running on http://localhost:${PORT}`);
    console.log(`[Server] Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  });
}

bootstrap();

export default app;
