
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


import {
    crearLeccion,
    reordenarLecciones
} from '../controllers/leccion.controller.js';

import {
    crearLeccionSchema,
    reordenarLeccionesSchema
} from '../validators/leccion.schemas.js';


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


router.post(
    '/:id/lecciones',
    autenticar,
    autorizarRoles('instructor'),
    validarIdCurso,
    verificarPropietarioCurso,
    validarBody(crearLeccionSchema),
    crearLeccion
);

router.patch(
    '/:id/lecciones/orden',
    autenticar,
    autorizarRoles('instructor'),
    validarIdCurso,
    verificarPropietarioCurso,
    validarBody(reordenarLeccionesSchema),
    reordenarLecciones
);


export default router;
