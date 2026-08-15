# Práctica 2: pipeline como código con Jenkins

Aplicación web full stack utilizada para implementar y verificar un pipeline declarativo en Jenkins durante la Unidad 3 de DevOps.

## Tecnologías

- Backend: Node.js, TypeScript, Fastify, Prisma y Vitest.
- Frontend: React, TypeScript, Vite y ESLint.
- Base de datos: PostgreSQL 17.
- Contenedores: Docker y Docker Compose.
- Automatización: Jenkins Pipeline.

## Estructura

- `backend/`: API y pruebas automatizadas.
- `frontend/`: interfaz web y análisis estático.
- `docker-compose.yml`: definición de los servicios del sistema.
- `Jenkinsfile`: pipeline declarativo de la práctica (se incorporará durante su desarrollo).

## Flujo previsto

El pipeline obtiene el código, instala dependencias, compila, ejecuta pruebas y análisis, construye imágenes Docker y publica versiones identificables en un registro.
