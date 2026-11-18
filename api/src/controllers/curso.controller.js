import {
    crearNuevoCurso,
    obtenerMisCursos,
    modificarCurso,
    borrarCurso
} from '../services/curso.service.js';

export async function crearCurso(req, res) {
    const curso = await crearNuevoCurso(
        req.usuario.id,
        req.body
    );

    return res.status(201).json({
        mensaje: 'Curso creado correctamente',
        curso
    });
}

export async function consultarMisCursos(req, res) {
    const { page, limit } = req.paginacion;

    const resultado = await obtenerMisCursos(
        req.usuario.id,
        page,
        limit
    );

    return res.status(200).json(resultado);
}

export async function editarCurso(req, res) {
    const curso = await modificarCurso(
        req.curso,
        req.body
    );

    return res.status(200).json({
        mensaje: 'Curso actualizado correctamente',
        curso
    });
}

export async function eliminarCurso(req, res) {
    await borrarCurso(req.curso);
    return res.status(204).send();
}
