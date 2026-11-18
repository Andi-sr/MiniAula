import {
    crearNuevoCurso,
    obtenerMisCursos,
    modificarCurso,
    borrarCurso,
    cambiarEstadoCurso,
    obtenerCatalogo,
    obtenerDetalleCurso
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


export async function actualizarEstadoCurso(req, res) {
    const curso = await cambiarEstadoCurso(
        req.curso,
        req.body.estado
    );

    return res.status(200).json({
        mensaje: 'Estado actualizado correctamente',
        curso
    });
}

export async function consultarCatalogo(req, res) {
    const resultado = await obtenerCatalogo(
        req.filtrosCatalogo
    );

    return res.status(200).json(resultado);
}

export async function consultarDetalleCurso(req, res) {
    const resultado = await obtenerDetalleCurso(
        req.cursoId
    );

    return res.status(200).json(resultado);
}

