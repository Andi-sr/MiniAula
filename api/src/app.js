
import express from 'express';

import apiRoutes from './routes/index.routes.js';

import { corsMiddleware } from './middlewares/cors.middleware.js';

import {
  notFoundHandler,
  errorHandler
} from './middlewares/error.middleware.js';

const app = express();

app.use(corsMiddleware);

// Procesar solicitudes en formato JSON
app.use(express.json());

// Prefijo principal de nuestra API
app.use('/api', apiRoutes);

// Manejo de rutas que no existen
app.use(notFoundHandler);

// Manejo centralizado de errores
app.use(errorHandler);

export default app;
