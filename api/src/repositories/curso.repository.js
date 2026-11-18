import { Curso, Leccion } from '../models/index.js';

export async function crearCursoBD(datos) {
    return await Curso.create(datos);
}

export async function buscarCursoPorId(id) {
    return await Curso.findByPk(id);
}

export async function listarCursosPorInstructor(
    instructorId,
    page,
    limit
) {
    const offset = (page - 1) * limit;

    return await Curso.findAndCountAll({
        where: { instructorId },
        order: [['id', 'DESC']],
        limit,
        offset
    });
}

export async function actualizarCursoBD(curso, datos) {
    return await curso.update(datos);
}

export async function contarLeccionesCurso(cursoId) {
    return await Leccion.count({
        where: { cursoId }
    });
}

export async function eliminarCursoBD(curso) {
    return await curso.destroy();
}
