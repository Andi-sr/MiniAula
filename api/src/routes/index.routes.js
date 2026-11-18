
import { Router } from 'express';

import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import cursosRoutes from './cursos.routes.js';
import instructorRoutes from './instructor.routes.js';
import leccionesRoutes from './lecciones.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/cursos', cursosRoutes);
router.use('/instructor', instructorRoutes);
router.use('/lecciones', leccionesRoutes);

export default router;
