import {
    cursoIdSchema,
    listarCursosSchema,
    catalogoCursosSchema
} from '../validators/curso.schemas.js';

import { buscarCursoPorId } from '../repositories/curso.repository.js';
import { AppError } from '../utils/app-error.js';

export function validarIdCurso(req, res, next) {
    const resultado = cursoIdSchema.safeParse(req.params);

    if (!resultado.success) {
        throw new AppError(
            422,
            'VALIDATION_ERROR',
            'Identificador de curso inválido'
        );
    }

    req.cursoId = resultado.data.id;
    next();
}

export function validarListadoCursos(req, res, next) {
    const resultado = listarCursosSchema.safeParse(req.query);

    if (!resultado.success) {
        throw new AppError(
            422,
            'VALIDATION_ERROR',
            'Parámetros de paginación inválidos'
        );
    }

    req.paginacion = resultado.data;
    next();
}

export async function verificarPropietarioCurso(req, res, next) {
    const curso = await buscarCursoPorId(req.cursoId);

    if (!curso) {
        throw new AppError(
            404,
            'COURSE_NOT_FOUND',
            'El curso no existe'
        );
    }

    if (Number(curso.instructorId) !== Number(req.usuario.id)) {
        throw new AppError(
            403,
            'FORBIDDEN',
            'No tienes permiso para modificar este curso'
        );
    }

    req.curso = curso;
    next();
}


export function validarCatalogoCursos(req, res, next) {
    const resultado = catalogoCursosSchema.safeParse(
        req.query
    );

    if (!resultado.success) {
        throw new AppError(
            422,
            'VALIDATION_ERROR',
            'Filtros del catálogo inválidos',
            resultado.error.issues
        );
    }

    req.filtrosCatalogo = resultado.data;
    next();
}

