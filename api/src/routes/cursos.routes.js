
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
    procesarFormularioLeccion
} from '../middlewares/video.middleware.js';

import {
    verificarInscripcionEstudiante,
    verificarAccesoLeccionMiddleware,
    validarIdLeccionRuta
} from '../middlewares/progreso.middleware.js';

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
    inscribir
} from '../controllers/inscripcion.controller.js';

import {
    consultarProgreso,
    consultarLeccionesProgreso,
    consultarPorcentaje,
    obtenerLeccion,
    marcarCompletada
} from '../controllers/progreso.controller.js';

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
    procesarFormularioLeccion(crearLeccionSchema),
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

router.post(
    '/:id/inscripcion',
    autenticar,
    autorizarRoles('estudiante'),
    validarIdCurso,
    inscribir
);

router.get(
    '/:id/progreso',
    autenticar,
    autorizarRoles('estudiante'),
    validarIdCurso,
    verificarInscripcionEstudiante,
    consultarProgreso
);

router.get(
    '/:id/progreso/lecciones',
    autenticar,
    autorizarRoles('estudiante'),
    validarIdCurso,
    verificarInscripcionEstudiante,
    consultarLeccionesProgreso
);

router.get(
    '/:id/progreso/porcentaje',
    autenticar,
    autorizarRoles('estudiante'),
    validarIdCurso,
    verificarInscripcionEstudiante,
    consultarPorcentaje
);

router.get(
    '/:id/lecciones/:leccionId',
    autenticar,
    autorizarRoles('estudiante'),
    validarIdCurso,
    validarIdLeccionRuta,
    verificarAccesoLeccionMiddleware,
    obtenerLeccion
);

router.post(
    '/:id/lecciones/:leccionId/completar',
    autenticar,
    autorizarRoles('estudiante'),
    validarIdCurso,
    validarIdLeccionRuta,
    verificarAccesoLeccionMiddleware,
    marcarCompletada
);


export default router;
