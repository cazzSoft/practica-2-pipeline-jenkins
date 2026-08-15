import { afterEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../lib/prisma', () => ({ prisma: prismaMock }));

import { buildApp } from '../app';

describe('POST /api/users', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('crea un usuario cuando los datos son válidos', async () => {
    const createdUser = {
      id: 1,
      name: 'Ana Pérez',
      email: 'ana@example.com',
      role: 'user',
      createdAt: new Date('2026-08-08T00:00:00Z'),
      updatedAt: new Date('2026-08-08T00:00:00Z'),
    };
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(createdUser);

    const app = buildApp(false);
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { name: 'Ana Pérez', email: 'ana@example.com' },
    });
    await app.close();

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      id: 1,
      name: 'Ana Pérez',
      email: 'ana@example.com',
      role: 'user',
    });
    expect(prismaMock.user.create).toHaveBeenCalledOnce();
  });

  it('rechaza una solicitud sin nombre', async () => {
    const app = buildApp(false);
    const response = await app.inject({
      method: 'POST',
      url: '/api/users',
      payload: { email: 'incompleto@example.com' },
    });
    await app.close();

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ message: 'Nombre y Email son requeridos' });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
