import cors from 'cors';
import type { CorsOptions } from 'cors';
import express from 'express';
import { env } from './config/env';
import { verifyFirebaseToken } from './presentation/http/middlewares/firebase-auth';
import { createSensorRoutes } from './presentation/http/routes/sensor-routes';
import { MySqlSensorDataStore } from './infrastructure/data/mysql-sensor-data-store';
import { logger } from './shared/logger';

export const app = express();

const allowedOrigins = env.allowedOrigins;
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/auth', verifyFirebaseToken, (req, res) => {
  res.json({ status: 'ok', uid: req.authUser?.uid ?? null });
});

app.use((req, _res, next) => {
  logger.info(
    {
      method: req.method,
      path: req.path,
      user: req.authUser?.uid ?? null
    },
    'API request'
  );
  next();
});

const sensorStore = new MySqlSensorDataStore();
app.use('/api/sensors', verifyFirebaseToken, createSensorRoutes(sensorStore));

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err: error }, 'Unhandled application error');
  res.status(500).json({ message: 'Unexpected server error' });
});
