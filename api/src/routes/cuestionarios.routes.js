
import { Router } from 'express';

import {
    registrarPregunta,
    consultarPreguntas,
    actualizarPregunta,
    eliminarPregunta,
    cambiarOrdenPreguntas
} from '../controllers/cuestionario.controller.js';

import {
    autenticar,
    autorizarRoles
} from '../middlewares/auth.middleware.js';

import { validarBody } from '../middlewares/validar.middleware.js';

import {
    validarIdLeccion,
    cargarLeccion
} from '../middlewares/leccion.middleware.js';

import {
    verificarPropietarioCurso
} from '../middlewares/curso.middleware.js';

import {
    validarIdPregunta,
    cargarPregunta
} from '../middlewares/cuestionario.middleware.js';

import {
    crearPreguntaSchema,
    editarPreguntaSchema,
    reordenarPreguntasSchema
} from '../validators/cuestionario.schemas.js';

const router = Router();

const protegerLeccion = [
    autenticar,
    autorizarRoles('instructor'),
    validarIdLeccion,
    cargarLeccion,
    verificarPropietarioCurso
];

// Consultar preguntas.
router.get(
    '/lecciones/:id/preguntas',
    protegerLeccion,
    consultarPreguntas
);

// Crear pregunta.
router.post(
    '/lecciones/:id/preguntas',
    protegerLeccion,
    validarBody(crearPreguntaSchema),
    registrarPregunta
);

// Modificar pregunta.
router.put(
    '/preguntas/:preguntaId',
    autenticar,
    autorizarRoles('instructor'),
    validarIdPregunta,
    cargarPregunta,
    verificarPropietarioCurso,
    validarBody(editarPreguntaSchema),
    actualizarPregunta
);

// Eliminar pregunta.
router.delete(
    '/preguntas/:preguntaId',
    autenticar,
    autorizarRoles('instructor'),
    validarIdPregunta,
    cargarPregunta,
    verificarPropietarioCurso,
    eliminarPregunta
);

// Reordenar preguntas.
router.patch(
    '/lecciones/:id/preguntas/orden',
    protegerLeccion,
    validarBody(reordenarPreguntasSchema),
    cambiarOrdenPreguntas
);

export default router;
