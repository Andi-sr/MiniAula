
import { Router } from 'express';

import {
    consultarMisCursos
} from '../controllers/curso.controller.js';

import {
    consultarLecciones
} from '../controllers/leccion.controller.js';

import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';

import {
    validarListadoCursos,
    validarIdCurso,
    verificarPropietarioCurso
} from '../middlewares/curso.middleware.js';

const router = Router();

router.get(
    '/cursos',
    autenticar,
    autorizarRoles('instructor'),
    validarListadoCursos,
    consultarMisCursos
);

router.get(
    '/cursos/:id/lecciones',
    autenticar,
    autorizarRoles('instructor'),
    validarIdCurso,
    verificarPropietarioCurso,
    consultarLecciones
);

export default router;
