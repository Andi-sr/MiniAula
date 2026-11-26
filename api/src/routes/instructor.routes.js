
import { Router } from 'express';

import {
    consultarMisCursos
} from '../controllers/curso.controller.js';

import {
    consultarLecciones,
    consultarLeccionInstructor
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

import {
    validarIdLeccionRuta
} from '../middlewares/progreso.middleware.js';

import {
    verificarLeccionDelCurso
} from '../middlewares/leccion.middleware.js';

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

router.get(
    '/cursos/:id/lecciones/:leccionId',
    autenticar,
    autorizarRoles('instructor'),
    validarIdCurso,
    verificarPropietarioCurso,
    validarIdLeccionRuta,
    verificarLeccionDelCurso,
    consultarLeccionInstructor
);

export default router;
