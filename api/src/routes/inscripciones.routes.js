
import { Router } from 'express';

import {
    misCursos,
    detalleCursoInscrito,
    estadoInscripcion
} from '../controllers/inscripcion.controller.js';

import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';

import {
    validarIdCurso
} from '../middlewares/curso.middleware.js';

import {
    verificarInscripcionEstudiante
} from '../middlewares/progreso.middleware.js';

const router = Router();

router.get(
    '/mis-cursos',
    autenticar,
    autorizarRoles('estudiante'),
    misCursos
);

router.get(
    '/cursos/:id/estado',
    autenticar,
    autorizarRoles('estudiante'),
    validarIdCurso,
    estadoInscripcion
);

router.get(
    '/cursos/:id',
    autenticar,
    autorizarRoles('estudiante'),
    validarIdCurso,
    verificarInscripcionEstudiante,
    detalleCursoInscrito
);

export default router;
