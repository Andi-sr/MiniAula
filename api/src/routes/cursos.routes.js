
import { Router } from 'express';

import {
    crearCurso,
    editarCurso,
    eliminarCurso,
    actualizarEstadoCurso,
    consultarCatalogo,
    consultarDetalleCurso
} from '../controllers/curso.controller.js';

import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';

import {
    validarBody
} from '../middlewares/validar.middleware.js';

import {
    crearCursoSchema,
    editarCursoSchema,
    cambiarEstadoSchema
} from '../validators/curso.schemas.js';

import {
    validarIdCurso,
    verificarPropietarioCurso,
    validarCatalogoCursos
} from '../middlewares/curso.middleware.js';

const router = Router();

router.get(
    '/',
    validarCatalogoCursos,
    consultarCatalogo
);

router.get(
    '/:id',
    validarIdCurso,
    consultarDetalleCurso
);

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

router.patch(
    '/:id/estado',
    autenticar,
    autorizarRoles('instructor'),
    validarIdCurso,
    verificarPropietarioCurso,
    validarBody(cambiarEstadoSchema),
    actualizarEstadoCurso
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
