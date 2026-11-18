
import { Router } from 'express';

import {
    crearCurso,
    editarCurso,
    eliminarCurso
} from '../controllers/curso.controller.js';

import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';

import { validarBody } from '../middlewares/validar.middleware.js';

import {
    crearCursoSchema,
    editarCursoSchema
} from '../validators/curso.schemas.js';

import {
    validarIdCurso,
    verificarPropietarioCurso
} from '../middlewares/curso.middleware.js';

const router = Router();

router.post(
    '/',
    autenticar,
    autorizarRoles('instructor'),
    validarBody(crearCursoSchema),
    crearCurso
);

router.put(
    '/:id',
    autenticar,
    autorizarRoles('instructor'),
    validarIdCurso,
    verificarPropietarioCurso,
    validarBody(editarCursoSchema),
    editarCurso
);

router.delete(
    '/:id',
    autenticar,
    autorizarRoles('instructor'),
    validarIdCurso,
    verificarPropietarioCurso,
    eliminarCurso
);

export default router;
