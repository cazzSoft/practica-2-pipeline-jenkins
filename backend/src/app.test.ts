import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from './app';

describe('GET /health', () => {
  const apps: ReturnType<typeof buildApp>[] = [];

  afterEach(async () => {
    await Promise.all(apps.splice(0).map((app) => app.close()));
  });

  it('confirma que el servicio está disponible', async () => {
    const app = buildApp(false);
    apps.push(app);

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      service: 'gestion-usuarios-backend',
    });
    expect(response.json().uptime).toEqual(expect.any(Number));
  });

  it('rechaza un método no permitido en la ruta de salud', async () => {
    const app = buildApp(false);
    apps.push(app);

    const response = await app.inject({ method: 'POST', url: '/health' });

    expect(response.statusCode).toBe(404);
  });
});
