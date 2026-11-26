import {
    leccionIdSchema
} from '../validators/leccion.schemas.js';

import {
    buscarLeccionPorId
} from '../repositories/leccion.repository.js';

import { AppError } from '../utils/app-error.js';

export function validarIdLeccion(req, res, next) {
    const resultado = leccionIdSchema.safeParse(req.params);

    if (!resultado.success) {
        throw new AppError(
            422,
            'VALIDATION_ERROR',
            'Identificador de leccion invalido'
        );
    }

    req.leccionId = resultado.data.id;
    next();
}

export async function verificarLeccionDelCurso(req, res, next) {
    const leccion = await buscarLeccionPorId(req.leccionId);

    if (
        !leccion ||
        Number(leccion.cursoId) !== Number(req.cursoId)
    ) {
        throw new AppError(
            404,
            'LESSON_NOT_FOUND',
            'La leccion no existe en este curso'
        );
    }

    req.leccion = leccion;
    next();
}

export async function cargarLeccion(req, res, next) {
    const leccion = await buscarLeccionPorId(req.leccionId);

    if (!leccion) {
        throw new AppError(
            404,
            'LESSON_NOT_FOUND',
            'La leccion no existe'
        );
    }

    req.leccion = leccion;
    req.cursoId = leccion.cursoId;

    next();
}
