
import {
    inscribirEstudiante,
    consultarMisCursos,
    consultarEstadoInscripcion,
    consultarCursoInscrito
} from '../services/inscripcion.service.js';

export async function inscribir(req, res) {
    const resultado = await inscribirEstudiante(
        req.usuario.id,
        req.cursoId
    );

    return res.status(201).json(resultado);
}

export async function misCursos(req, res) {
    const resultado = await consultarMisCursos(req.usuario.id);
    return res.status(200).json(resultado);
}

export async function estadoInscripcion(req, res) {
    const resultado = await consultarEstadoInscripcion(
        req.usuario.id,
        req.cursoId
    );

    return res.status(200).json(resultado);
}

export async function detalleCursoInscrito(req, res) {
    const resultado = await consultarCursoInscrito(
        req.usuario.id,
        req.cursoId
    );

    return res.status(200).json(resultado);
}
