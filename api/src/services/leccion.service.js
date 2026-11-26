
import {
    crearLeccionBD,
    buscarLeccionPorId,
    listarLeccionesBD,
    actualizarLeccionBD,
    eliminarLeccionBD,
    ejecutarConCursoBloqueado,
    reordenarLeccionesBD
} from '../repositories/leccion.repository.js';

import {
    eliminarArchivoAbsoluto,
    generarNombreVideo,
    guardarVideoEnDisco,
    prepararEliminacionVideo,
    restaurarVideoTemporal,
    rutaRelativaVideo
} from '../utils/video.util.js';

import {
    serializarLeccion,
    serializarLecciones
} from '../utils/leccion.serializer.js';

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

async function guardarVideoNuevo(archivoVideo) {
    const nombre = generarNombreVideo(archivoVideo.originalname);
    const absoluta = await guardarVideoEnDisco(
        archivoVideo.buffer,
        nombre
    );

    return {
        nombre,
        absoluta,
        relativa: rutaRelativaVideo(nombre)
    };
}

export async function crearNuevaLeccion(
    cursoId,
    datos,
    archivoVideo = null
) {
    const video = archivoVideo
        ? await guardarVideoNuevo(archivoVideo)
        : null;

    try {
        const leccion = await ejecutarConCursoBloqueado(
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
                    videoUrl: null,
                    videoPath: video ? video.relativa : null,
                    orden,
                    notaMinima: null,
                    cursoId
                }, transaction);
            }
        );

        return serializarLeccion(leccion);
    } catch (error) {
        if (video) {
            await eliminarArchivoAbsoluto(video.absoluta);
        }

        throw error;
    }
}

export async function obtenerLeccionesCurso(cursoId) {
    const lecciones = await listarLeccionesBD(cursoId);
    return serializarLecciones(lecciones);
}

export async function modificarLeccion(
    cursoId,
    leccionId,
    datos,
    archivoVideo = null
) {
    const video = archivoVideo
        ? await guardarVideoNuevo(archivoVideo)
        : null;

    let temporal = null;
    let rutaOriginal = null;

    try {
        const leccionActualizada = await ejecutarConCursoBloqueado(
            cursoId,
            async (curso, transaction) => {
                comprobarCurso(curso);

                const leccion = await buscarLeccionPorId(
                    leccionId,
                    transaction
                );

                comprobarLeccion(leccion, cursoId);

                rutaOriginal = leccion.videoPath || null;

                const cambios = {};

                if (datos.titulo !== undefined) {
                    cambios.titulo = datos.titulo;
                }

                if (datos.contenido !== undefined) {
                    cambios.contenido = datos.contenido;
                }

                if (video || datos.videoPath === null) {
                    temporal = await prepararEliminacionVideo(
                        rutaOriginal
                    );
                    cambios.videoPath = video
                        ? video.relativa
                        : null;
                }

                return await actualizarLeccionBD(
                    leccion,
                    cambios,
                    transaction
                );
            }
        );

        if (temporal || video) {
            await eliminarArchivoAbsoluto(temporal);
        }

        return serializarLeccion(leccionActualizada);
    } catch (error) {
        if (temporal) {
            await restaurarVideoTemporal(temporal, rutaOriginal);
        }

        if (video) {
            await eliminarArchivoAbsoluto(video.absoluta);
        }

        throw error;
    }
}

export async function borrarLeccion(cursoId, leccionId) {
    let temporal = null;
    let rutaOriginal = null;

    try {
        await ejecutarConCursoBloqueado(
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

                rutaOriginal = leccion.videoPath || null;
                temporal = await prepararEliminacionVideo(
                    rutaOriginal
                );

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

        await eliminarArchivoAbsoluto(temporal);
    } catch (error) {
        if (temporal) {
            await restaurarVideoTemporal(temporal, rutaOriginal);
        }

        throw error;
    }
}

export async function cambiarOrdenLecciones(cursoId, leccionIds) {
    const lecciones = await ejecutarConCursoBloqueado(
        cursoId,
        async (curso, transaction) => {
            comprobarCurso(curso);

            const leccionesBD = await listarLeccionesBD(
                cursoId,
                transaction
            );

            const idsActuales = new Set(
                leccionesBD.map(l => Number(l.id))
            );

            const ordenValido =
                leccionIds.length === leccionesBD.length &&
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
                leccionesBD,
                leccionIds,
                transaction
            );

            return await listarLeccionesBD(
                cursoId,
                transaction
            );
        }
    );

    return serializarLecciones(lecciones);
}
