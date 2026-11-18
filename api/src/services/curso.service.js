import {
    crearCursoBD,
    listarCursosPorInstructor,
    actualizarCursoBD,
    contarLeccionesCurso,
    eliminarCursoBD,
    listarCatalogoBD,
    buscarCursoPublicadoPorId,
    obtenerTemarioBD
} from '../repositories/curso.repository.js';

import { AppError } from '../utils/app-error.js';

export async function crearNuevoCurso(instructorId, datos) {
    return await crearCursoBD({
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        categoria: datos.categoria,
        nivel: datos.nivel,
        estado: 'borrador',
        instructorId
    });
}

export async function obtenerMisCursos(instructorId, page, limit) {
    const resultado = await listarCursosPorInstructor(
        instructorId,
        page,
        limit
    );

    return {
        cursos: resultado.rows,
        total: resultado.count,
        page,
        limit,
        totalPages: Math.ceil(resultado.count / limit)
    };
}

export async function modificarCurso(curso, datos) {
    return await actualizarCursoBD(curso, datos);
}

export async function borrarCurso(curso) {
    if (curso.estado !== 'borrador') {
        throw new AppError(
            409,
            'COURSE_NOT_DELETABLE',
            'Solo puedes eliminar cursos en borrador'
        );
    }

    const cantidad = await contarLeccionesCurso(curso.id);

    if (cantidad > 0) {
        throw new AppError(
            409,
            'COURSE_HAS_LESSONS',
            'Elimina primero las lecciones del curso'
        );
    }

    await eliminarCursoBD(curso);
}


export async function cambiarEstadoCurso(curso, estado) {
    if (estado === 'publicado') {
        const cantidad = await contarLeccionesCurso(curso.id);

        if (cantidad === 0) {
            throw new AppError(
                409,
                'COURSE_WITHOUT_LESSONS',
                'No puedes publicar un curso sin lecciones'
            );
        }
    }

    return await actualizarCursoBD(curso, { estado });
}


export async function obtenerCatalogo(filtros) {
    const resultado = await listarCatalogoBD(filtros);

    return {
        cursos: resultado.rows,
        total: resultado.count,
        page: filtros.page,
        limit: filtros.limit,
        totalPages: Math.ceil(
            resultado.count / filtros.limit
        )
    };
}


export async function obtenerDetalleCurso(id) {
    const curso = await buscarCursoPublicadoPorId(id);

    if (!curso) {
        throw new AppError(
            404,
            'COURSE_NOT_FOUND',
            'El curso no existe o no está publicado'
        );
    }

    const temario = await obtenerTemarioBD(id);

    return {
        curso,
        temario
    };
}

