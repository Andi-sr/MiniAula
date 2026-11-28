
import { preguntaIdSchema } from '../validators/cuestionario.schemas.js';
import { buscarPreguntaPorId } from '../repositories/pregunta.repository.js';
import { buscarLeccionPorId } from '../repositories/leccion.repository.js';
import { AppError } from '../utils/app-error.js';

export function validarIdPregunta(req, res, next) {
    const resultado = preguntaIdSchema.safeParse(req.params);

    if (!resultado.success) {
        throw new AppError(
            422,
            'VALIDATION_ERROR',
            'Identificador de pregunta inválido'
        );
    }

    req.preguntaId = resultado.data.preguntaId;
    next();
}

export async function cargarPregunta(req, res, next) {
    const pregunta = await buscarPreguntaPorId(req.preguntaId);

    if (!pregunta) {
        throw new AppError(
            404,
            'QUESTION_NOT_FOUND',
            'La pregunta no existe'
        );
    }

    const leccion = await buscarLeccionPorId(pregunta.leccionId);

    if (!leccion) {
        throw new AppError(
            404,
            'LESSON_NOT_FOUND',
            'La lección no existe'
        );
    }

    req.pregunta = pregunta;
    req.leccion = leccion;
    req.leccionId = leccion.id;
    req.cursoId = leccion.cursoId;

    next();
}
