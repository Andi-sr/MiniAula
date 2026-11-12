
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';

import {
    registrar,
    login,
    consultarSesion,
    verificarInstructor
} from '../controllers/auth.controller.js';

import {
    validarBody
} from '../middlewares/validar.middleware.js';

import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';

import {
    registroSchema,
    loginSchema
} from '../validators/auth.schemas.js';

const router = Router();

// Limitar solicitudes de inicio de sesión
const limitarLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Demasiados intentos. Inténtalo más tarde.',
            details: null
        }
    }
});

// Registrar estudiante o instructor
router.post(
    '/register',
    validarBody(registroSchema),
    registrar
);

// Iniciar sesión
router.post(
    '/login',
    limitarLogin,
    validarBody(loginSchema),
    login
);

// Consultar sesión
router.get(
    '/sesion',
    autenticar,
    consultarSesion
);

// Ruta temporal: solamente instructores
router.get(
    '/instructor/prueba',
    autenticar,
    autorizarRoles('instructor'),
    verificarInstructor
);

export default router;
