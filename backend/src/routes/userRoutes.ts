import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';

interface UserParams {
  id: string;
}

interface UserBody {
  name: string;
  email: string;
  role?: string;
}

export async function userRoutes(fastify: FastifyInstance) {
  // GET /api/users - Listar todos los usuarios
  fastify.get('/api/users', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { id: 'desc' },
      });
      return reply.send(users);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error al obtener usuarios' });
    }
  });

  // GET /api/users/:id - Obtener un usuario por ID
  fastify.get<{ Params: UserParams }>(
    '/api/users/:id',
    async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
      try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
          return reply.status(400).send({ message: 'ID de usuario inválido' });
        }

        const user = await prisma.user.findUnique({
          where: { id },
        });

        if (!user) {
          return reply.status(404).send({ message: 'Usuario no encontrado' });
        }

        return reply.send(user);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ message: 'Error al obtener el usuario' });
      }
    }
  );

  // POST /api/users - Crear usuario
  fastify.post<{ Body: UserBody }>(
    '/api/users',
    async (request: FastifyRequest<{ Body: UserBody }>, reply: FastifyReply) => {
      try {
        const { name, email, role } = request.body;

        if (!name || !email) {
          return reply.status(400).send({ message: 'Nombre y Email son requeridos' });
        }

        // Verificar si el email ya existe
        const existing = await prisma.user.findUnique({
          where: { email },
        });

        if (existing) {
          return reply.status(400).send({ message: 'El correo electrónico ya está registrado' });
        }

        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            role: role || 'user',
          },
        });

        return reply.status(201).send(newUser);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ message: 'Error al crear el usuario' });
      }
    }
  );

  // PUT /api/users/:id - Actualizar usuario
  fastify.put<{ Params: UserParams; Body: UserBody }>(
    '/api/users/:id',
    async (request: FastifyRequest<{ Params: UserParams; Body: UserBody }>, reply: FastifyReply) => {
      try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
          return reply.status(400).send({ message: 'ID de usuario inválido' });
        }

        const { name, email, role } = request.body;

        // Validar si el usuario existe
        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) {
          return reply.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Si se cambia el email, verificar unicidad
        if (email && email !== existing.email) {
          const emailCheck = await prisma.user.findUnique({ where: { email } });
          if (emailCheck) {
            return reply.status(400).send({ message: 'El nuevo correo electrónico ya está en uso' });
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            name: name ?? existing.name,
            email: email ?? existing.email,
            role: role ?? existing.role,
          },
        });

        return reply.send(updatedUser);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ message: 'Error al actualizar el usuario' });
      }
    }
  );

  // DELETE /api/users/:id - Eliminar usuario
  fastify.delete<{ Params: UserParams }>(
    '/api/users/:id',
    async (request: FastifyRequest<{ Params: UserParams }>, reply: FastifyReply) => {
      try {
        const id = parseInt(request.params.id, 10);
        if (isNaN(id)) {
          return reply.status(400).send({ message: 'ID de usuario inválido' });
        }

        const existing = await prisma.user.findUnique({ where: { id } });
        if (!existing) {
          return reply.status(404).send({ message: 'Usuario no encontrado' });
        }

        await prisma.user.delete({
          where: { id },
        });

        return reply.send({ message: 'Usuario eliminado correctamente' });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ message: 'Error al eliminar el usuario' });
      }
    }
  );
}
