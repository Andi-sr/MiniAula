
import { Router } from 'express';

import {
    consultarMisCursos
} from '../controllers/curso.controller.js';

import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';

import {
    validarListadoCursos
} from '../middlewares/curso.middleware.js';

const router = Router();

router.get(
    '/cursos',
    autenticar,
    autorizarRoles('instructor'),
    validarListadoCursos,
    consultarMisCursos
);

export default router;
