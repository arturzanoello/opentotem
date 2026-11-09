import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

const logger = pino({ level: 'silent' });

describe('GET /health', () => {
  it('returns 200 when the database answers', async () => {
    const app = createApp({ logger, checkDb: async () => {} });

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'ok' });
  });

  it('returns 503 when the database is down', async () => {
    const app = createApp({
      logger,
      checkDb: async () => {
        throw new Error('connection refused');
      },
    });

    const res = await request(app).get('/health');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'degraded', db: 'down' });
  });
});

describe('unknown routes', () => {
  it('answer 404 as application/problem+json', async () => {
    const app = createApp({ logger, checkDb: async () => {} });

    const res = await request(app).get('/v1/nope');

    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(res.body).toMatchObject({ type: 'about:blank', title: 'Not Found', status: 404 });
  });
});
