import express, { type ErrorRequestHandler, type Express } from 'express';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { sendProblem } from './http/problem';

export interface AppDeps {
  logger: Logger;
  /** Resolves when the database answers; rejects otherwise. */
  checkDb: () => Promise<void>;
}

export function createApp({ logger, checkDb }: AppDeps): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(pinoHttp({ logger }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', async (req, res) => {
    const startedAt = performance.now();
    try {
      await checkDb();
      res.json({ status: 'ok', db: 'ok', latencyMs: Math.round(performance.now() - startedAt) });
    } catch (err) {
      req.log.error({ err }, 'health check failed');
      res.status(503).json({ status: 'degraded', db: 'down' });
    }
  });

  app.use((req, res) => {
    sendProblem(res, {
      title: 'Not Found',
      status: 404,
      detail: `No route for ${req.method} ${req.path}`,
    });
  });

  const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    req.log.error({ err }, 'unhandled error');
    sendProblem(res, { title: 'Internal Server Error', status: 500 });
  };
  app.use(errorHandler);

  return app;
}
