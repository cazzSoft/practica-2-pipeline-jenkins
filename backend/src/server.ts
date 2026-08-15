import { buildApp } from './app';

const app = buildApp();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const start = async () => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
