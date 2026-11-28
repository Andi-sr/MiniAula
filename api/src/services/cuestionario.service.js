
import {
    crearPreguntaBD,
    buscarPreguntaPorId,
    listarPreguntasBD,
    actualizarPreguntaBD,
    eliminarPreguntaBD
} from '../repositories/pregunta.repository.js';

import { buscarLeccionPorId } from '../repositories/leccion.repository.js';
import { AppError } from '../utils/app-error.js';

function comprobarLeccionCuestionario(leccion) {
    if (!leccion) {
        throw new AppError(
            404,
            'LESSON_NOT_FOUND',
            'La lección no existe'
        );
    }

    if (leccion.tipo !== 'cuestionario') {
        throw new AppError(
            409,
            'INVALID_LESSON_TYPE',
            'Esta lección no es un cuestionario'
        );
    }
}

function validarDatosPregunta(datos) {
    if (
        typeof datos.enunciado !== 'string' ||
        !datos.enunciado.trim()
    ) {
        throw new AppError(
            422,
            'INVALID_QUESTION',
            'El enunciado de la pregunta es obligatorio'
        );
    }

    if (
        !Array.isArray(datos.opciones) ||
        datos.opciones.length < 2 ||
        datos.opciones.length > 6 ||
        datos.opciones.some(
            opcion => typeof opcion !== 'string' || !opcion.trim()
        )
    ) {
        throw new AppError(
            422,
            'INVALID_OPTIONS',
            'Debes registrar entre 2 y 6 opciones válidas'
        );
    }

    if (
        !Number.isInteger(datos.correcta) ||
        datos.correcta < 0 ||
        datos.correcta >= datos.opciones.length
    ) {
        throw new AppError(
            422,
            'INVALID_CORRECT_OPTION',
            'La opción correcta no es válida'
        );
    }
}

function prepararPregunta(datos, leccionId, orden) {
    return {
        leccionId,
        enunciado: datos.enunciado.trim(),
        opciones: datos.opciones.map(opcion => opcion.trim()),
        correcta: datos.correcta,
        orden
    };
}

// Crear una pregunta para una lección.
export async function crearPregunta(leccionId, datos) {
    const leccion = await buscarLeccionPorId(leccionId);

    comprobarLeccionCuestionario(leccion);
    validarDatosPregunta(datos);

    const preguntas = await listarPreguntasBD(leccionId);

    const orden = preguntas.length + 1;

    const pregunta = await crearPreguntaBD(
        prepararPregunta(datos, leccionId, orden)
    );

    return {
        id: pregunta.id,
        enunciado: pregunta.enunciado,
        opciones: pregunta.opciones,
        correcta: pregunta.correcta,
        orden: pregunta.orden
    };
}

// Consultar las preguntas de una lección.
export async function obtenerPreguntas(leccionId) {
    const leccion = await buscarLeccionPorId(leccionId);

    comprobarLeccionCuestionario(leccion);

    const preguntas = await listarPreguntasBD(leccionId);

    return preguntas.map(pregunta => ({
        id: pregunta.id,
        enunciado: pregunta.enunciado,
        opciones: pregunta.opciones,
        correcta: pregunta.correcta,
        orden: pregunta.orden
    }));
}

// Modificar una pregunta.
export async function modificarPregunta(preguntaId, datos) {
    const pregunta = await buscarPreguntaPorId(preguntaId);

    if (!pregunta) {
        throw new AppError(
            404,
            'QUESTION_NOT_FOUND',
            'La pregunta no existe'
        );
    }

    validarDatosPregunta(datos);

    await actualizarPreguntaBD(pregunta, {
        enunciado: datos.enunciado.trim(),
        opciones: datos.opciones.map(opcion => opcion.trim()),
        correcta: datos.correcta
    });

    return {
        id: pregunta.id,
        enunciado: pregunta.enunciado,
        opciones: pregunta.opciones,
        correcta: pregunta.correcta,
        orden: pregunta.orden
    };
}

// Eliminar una pregunta.
export async function borrarPregunta(preguntaId) {
    const pregunta = await buscarPreguntaPorId(preguntaId);

    if (!pregunta) {
        throw new AppError(
            404,
            'QUESTION_NOT_FOUND',
            'La pregunta no existe'
        );
    }

    await eliminarPreguntaBD(pregunta);
}

// Reordenar las preguntas de una lección.
export async function reordenarPreguntas(leccionId, preguntaIds) {
    const leccion = await buscarLeccionPorId(leccionId);

    comprobarLeccionCuestionario(leccion);

    const preguntas = await listarPreguntasBD(leccionId);

    const idsActuales = new Set(
        preguntas.map(pregunta => Number(pregunta.id))
    );

    const ordenValido =
        Array.isArray(preguntaIds) &&
        preguntaIds.length === preguntas.length &&
        preguntaIds.every(id => idsActuales.has(Number(id))) &&
        new Set(preguntaIds.map(Number)).size === preguntaIds.length;

    if (!ordenValido) {
        throw new AppError(
            422,
            'INVALID_QUESTION_ORDER',
            'Debes incluir todas las preguntas una sola vez'
        );
    }

    for (let i = 0; i < preguntaIds.length; i++) {
        const pregunta = preguntas.find(
            item => Number(item.id) === Number(preguntaIds[i])
        );

        await actualizarPreguntaBD(pregunta, {
            orden: i + 1
        });
    }

    return await obtenerPreguntas(leccionId);
}
