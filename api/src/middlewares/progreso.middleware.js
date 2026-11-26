
import { buscarInscripcion } from '../repositories/inscripcion.repository.js';
import { verificarAccesoLeccion } from '../services/progreso.service.js';
import { leccionRutaSchema } from '../validators/leccion.schemas.js';
import { AppError } from '../utils/app-error.js';

export function validarIdLeccionRuta(req, res, next) {
    const resultado = leccionRutaSchema.safeParse(req.params);

    if (!resultado.success) {
        throw new AppError(
            422,
            'VALIDATION_ERROR',
            'Identificador de lección inválido'
        );
    }

    req.leccionId = resultado.data.leccionId;
    next();
}

export async function verificarInscripcionEstudiante(req, res, next) {
    const inscripcion = await buscarInscripcion(
        req.usuario.id,
        req.cursoId
    );

    if (!inscripcion) {
        throw new AppError(
            403,
            'NOT_ENROLLED',
            'Debes inscribirte en el curso para acceder'
        );
    }

    req.inscripcion = inscripcion;
    next();
}

export async function verificarAccesoLeccionMiddleware(
    req,
    res,
    next
) {
    await verificarAccesoLeccion(
        req.usuario.id,
        req.cursoId,
        req.leccionId
    );

    next();
}
