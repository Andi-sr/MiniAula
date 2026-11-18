import { Curso, Leccion } from '../models/index.js';
import { Op } from 'sequelize';

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


export async function listarCatalogoBD(filtros) {
    const { q, categoria, page, limit } = filtros;

    const where = {
        estado: 'publicado'
    };

    if (q) {
        where.titulo = {
            [Op.like]: `%${q}%`
        };
    }

    if (categoria) {
        where.categoria = categoria;
    }

    return await Curso.findAndCountAll({
        where,
        attributes: [
            'id',
            'titulo',
            'descripcion',
            'categoria',
            'nivel',
            'estado',
            'instructorId',
            'creadoEn'
        ],
        order: [['id', 'DESC']],
        limit,
        offset: (page - 1) * limit
    });
}

export async function buscarCursoPublicadoPorId(id) {
    return await Curso.findOne({
        where: {
            id,
            estado: 'publicado'
        }
    });
}

export async function obtenerTemarioBD(cursoId) {
    return await Leccion.findAll({
        where: { cursoId },
        attributes: [
            'id',
            'titulo',
            'tipo',
            'orden'
        ],
        order: [['orden', 'ASC']]
    });
}

