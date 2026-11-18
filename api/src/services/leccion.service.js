import {
    crearLeccionBD,
    buscarLeccionPorId,
    listarLeccionesBD,
    actualizarLeccionBD,
    eliminarLeccionBD,
    ejecutarConCursoBloqueado,
    reordenarLeccionesBD
} from '../repositories/leccion.repository.js';

import { AppError } from '../utils/app-error.js';

function comprobarCurso(curso) {
    if (!curso) {
        throw new AppError(
            404,
            'COURSE_NOT_FOUND',
            'El curso no existe'
        );
    }
}

function comprobarLeccion(leccion, cursoId) {
    if (!leccion || Number(leccion.cursoId) !== Number(cursoId)) {
        throw new AppError(
            404,
            'LESSON_NOT_FOUND',
            'La leccion no existe'
        );
    }

    if (leccion.tipo !== 'contenido') {
        throw new AppError(
            409,
            'INVALID_LESSON_TYPE',
            'Esta operacion es solo para lecciones de contenido'
        );
    }
}

export async function crearNuevaLeccion(cursoId, datos) {
    return await ejecutarConCursoBloqueado(
        cursoId,
        async (curso, transaction) => {
            comprobarCurso(curso);

            const lecciones = await listarLeccionesBD(
                cursoId,
                transaction
            );

            const orden = Math.max(
                0,
                ...lecciones.map(l => Number(l.orden))
            ) + 1;

            return await crearLeccionBD({
                titulo: datos.titulo,
                tipo: 'contenido',
                contenido: datos.contenido,
                videoUrl: datos.videoUrl ?? null,
                orden,
                notaMinima: null,
                cursoId
            }, transaction);
        }
    );
}

export async function obtenerLeccionesCurso(cursoId) {
    return await listarLeccionesBD(cursoId);
}

export async function modificarLeccion(cursoId, leccionId, datos) {
    return await ejecutarConCursoBloqueado(
        cursoId,
        async (curso, transaction) => {
            comprobarCurso(curso);

            const leccion = await buscarLeccionPorId(
                leccionId,
                transaction
            );

            comprobarLeccion(leccion, cursoId);

            return await actualizarLeccionBD(
                leccion,
                datos,
                transaction
            );
        }
    );
}

export async function borrarLeccion(cursoId, leccionId) {
    return await ejecutarConCursoBloqueado(
        cursoId,
        async (curso, transaction) => {
            comprobarCurso(curso);

            const leccion = await buscarLeccionPorId(
                leccionId,
                transaction
            );

            comprobarLeccion(leccion, cursoId);

            const lecciones = await listarLeccionesBD(
                cursoId,
                transaction
            );

            if (
                curso.estado === 'publicado' &&
                lecciones.length === 1
            ) {
                throw new AppError(
                    409,
                    'COURSE_WITHOUT_LESSONS',
                    'Un curso publicado debe tener al menos una leccion'
                );
            }

            await eliminarLeccionBD(leccion, transaction);

            const restantes = lecciones.filter(
                l => Number(l.id) !== Number(leccionId)
            );

            const ids = restantes.map(l => Number(l.id));

            await reordenarLeccionesBD(
                restantes,
                ids,
                transaction
            );
        }
    );
}

export async function cambiarOrdenLecciones(cursoId, leccionIds) {
    return await ejecutarConCursoBloqueado(
        cursoId,
        async (curso, transaction) => {
            comprobarCurso(curso);

            const lecciones = await listarLeccionesBD(
                cursoId,
                transaction
            );

            const idsActuales = new Set(
                lecciones.map(l => Number(l.id))
            );

            const ordenValido =
                leccionIds.length === lecciones.length &&
                leccionIds.every(id => idsActuales.has(id)) &&
                new Set(leccionIds).size === leccionIds.length;

            if (!ordenValido) {
                throw new AppError(
                    422,
                    'INVALID_LESSON_ORDER',
                    'Debes incluir todas las lecciones del curso una sola vez'
                );
            }

            await reordenarLeccionesBD(
                lecciones,
                leccionIds,
                transaction
            );

            return await listarLeccionesBD(
                cursoId,
                transaction
            );
        }
    );
}
