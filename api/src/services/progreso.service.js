
import {
    buscarCursoPorId
} from '../repositories/curso.repository.js';

import {
    buscarInscripcion,
    buscarCursoConBloqueo
} from '../repositories/inscripcion.repository.js';

import {
    listarLeccionesContenido,
    buscarLeccionPorId,
    listarProgresosCompletados,
    buscarProgreso,
    guardarProgresoBD,
    actualizarProgresoBD,
    ejecutarTransaccion as transaccionProgreso
} from '../repositories/progreso.repository.js';

import {
    serializarLeccion,
    serializarLecciones
} from '../utils/leccion.serializer.js';

import { AppError } from '../utils/app-error.js';

function construirResumen(cursoId, lecciones, registros) {
    const idsCompletadas = new Set(
        registros.map(registro => Number(registro.leccionId))
    );

    const completadas = lecciones.filter(
        leccion => idsCompletadas.has(Number(leccion.id))
    );

    const pendientes = lecciones.filter(
        leccion => !idsCompletadas.has(Number(leccion.id))
    );

    const leccionActual = pendientes[0] || null;

    const bloqueadas = leccionActual
        ? pendientes.filter(
            leccion => Number(leccion.orden) > Number(leccionActual.orden)
        )
        : [];

    const total = lecciones.length;
    const cantidadCompletadas = completadas.length;
    const porcentaje = total === 0
        ? 0
        : Math.round((cantidadCompletadas / total) * 100);

    let estado = 'sin_lecciones';

    if (total > 0) {
        if (cantidadCompletadas === total) {
            estado = 'completado';
        } else if (cantidadCompletadas === 0) {
            estado = 'sin_iniciar';
        } else {
            estado = 'en_progreso';
        }
    }

    return {
        cursoId,
        totalLecciones: total,
        leccionesCompletadas: cantidadCompletadas,
        leccionesPendientes: pendientes.length,
        porcentaje,
        estado,
        leccionActual: leccionActual
            ? serializarLeccion(leccionActual)
            : null,
        completadas: serializarLecciones(completadas),
        pendientes: serializarLecciones(pendientes),
        bloqueadas: serializarLecciones(bloqueadas)
    };
}

export async function calcularProgreso(
    usuarioId,
    cursoId,
    transaction = null
) {
    const lecciones = await listarLeccionesContenido(
        cursoId,
        transaction
    );

    const registros = await listarProgresosCompletados(
        usuarioId,
        cursoId,
        transaction
    );

    return construirResumen(cursoId, lecciones, registros);
}

async function comprobarCursoDisponible(cursoId, transaction) {
    const curso = await buscarCursoPorId(cursoId, transaction);

    if (!curso) {
        throw new AppError(
            404,
            'COURSE_NOT_FOUND',
            'El curso no existe'
        );
    }

    if (curso.estado !== 'publicado') {
        throw new AppError(
            409,
            'COURSE_NOT_AVAILABLE',
            'Este curso no está disponible para estudiar'
        );
    }

    return curso;
}

async function comprobarInscripcion(
    usuarioId,
    cursoId,
    transaction
) {
    const inscripcion = await buscarInscripcion(
        usuarioId,
        cursoId,
        transaction
    );

    if (!inscripcion) {
        throw new AppError(
            403,
            'NOT_ENROLLED',
            'Debes inscribirte en el curso para acceder'
        );
    }

    return inscripcion;
}

export async function verificarAccesoLeccion(
    usuarioId,
    cursoId,
    leccionId,
    transaction = null
) {
    const curso = await comprobarCursoDisponible(
        cursoId,
        transaction
    );

    const inscripcion = await comprobarInscripcion(
        usuarioId,
        cursoId,
        transaction
    );

    const leccion = await buscarLeccionPorId(
        leccionId,
        transaction
    );

    if (!leccion || Number(leccion.cursoId) !== Number(cursoId)) {
        throw new AppError(
            404,
            'LESSON_NOT_FOUND',
            'La leccion no existe en este curso'
        );
    }

    if (leccion.tipo !== 'contenido') {
        throw new AppError(
            409,
            'INVALID_LESSON_TYPE',
            'Esta leccion no es de contenido'
        );
    }

    const progreso = await calcularProgreso(
        usuarioId,
        cursoId,
        transaction
    );

    const completada = progreso.completadas.some(
        item => Number(item.id) === Number(leccionId)
    );

    const esActual = progreso.leccionActual &&
        Number(progreso.leccionActual.id) === Number(leccionId);

    if (!completada && !esActual) {
        throw new AppError(
            403,
            'LESSON_LOCKED',
            'Primero debes completar la lección anterior'
        );
    }

    return { curso, inscripcion, leccion, progreso };
}

export async function obtenerLeccionAprendizaje(
    usuarioId,
    cursoId,
    leccionId
) {
    const acceso = await verificarAccesoLeccion(
        usuarioId,
        cursoId,
        leccionId
    );

    return {
        curso: {
            id: acceso.curso.id,
            titulo: acceso.curso.titulo,
            estado: acceso.curso.estado
        },
        leccion: serializarLeccion(acceso.leccion),
        progreso: acceso.progreso
    };
}

export async function completarLeccion(
    usuarioId,
    cursoId,
    leccionId
) {
    return await transaccionProgreso(async transaction => {
        await buscarCursoConBloqueo(cursoId, transaction);

        const acceso = await verificarAccesoLeccion(
            usuarioId,
            cursoId,
            leccionId,
            transaction
        );

        const progresoExistente = await buscarProgreso(
            usuarioId,
            leccionId,
            transaction
        );

        if (progresoExistente?.estado === 'completada') {
            return {
                mensaje: 'La lección ya estaba completada',
                progreso: await calcularProgreso(
                    usuarioId,
                    cursoId,
                    transaction
                )
            };
        }

        if (progresoExistente) {
            await actualizarProgresoBD(
                progresoExistente,
                {
                    estado: 'completada',
                    fechaFinalizacion: new Date()
                },
                transaction
            );
        } else {
            await guardarProgresoBD({
                usuarioId,
                cursoId,
                leccionId,
                estado: 'completada',
                fechaInicio: new Date(),
                fechaFinalizacion: new Date()
            }, transaction);
        }

        return {
            mensaje: 'Lección completada correctamente',
            progreso: await calcularProgreso(
                usuarioId,
                cursoId,
                transaction
            )
        };
    });
}

export async function obtenerProgresoCurso(usuarioId, cursoId) {
    await comprobarCursoDisponible(cursoId);
    await comprobarInscripcion(usuarioId, cursoId);
    return await calcularProgreso(usuarioId, cursoId);
}

export async function inicializarProgreso(usuarioId, cursoId) {
    return await calcularProgreso(usuarioId, cursoId);
}
