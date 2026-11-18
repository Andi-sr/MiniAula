import { Router } from 'express';

import {
    editarLeccion,
    eliminarLeccion
} from '../controllers/leccion.controller.js';

import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';

import {
    validarIdLeccion,
    cargarLeccion
} from '../middlewares/leccion.middleware.js';

import {
    verificarPropietarioCurso
} from '../middlewares/curso.middleware.js';

import { validarBody } from '../middlewares/validar.middleware.js';

import {
    editarLeccionSchema
} from '../validators/leccion.schemas.js';

const router = Router();

router.put(
    '/:id',
    autenticar,
    autorizarRoles('instructor'),
    validarIdLeccion,
    cargarLeccion,
    verificarPropietarioCurso,
    validarBody(editarLeccionSchema),
    editarLeccion
);

router.delete(
    '/:id',
    autenticar,
    autorizarRoles('instructor'),
    validarIdLeccion,
    cargarLeccion,
    verificarPropietarioCurso,
    eliminarLeccion
);

export default router;
