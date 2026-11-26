
import { UniqueConstraintError } from 'sequelize';

import {
    ejecutarTransaccion,
    buscarInscripcion,
    crearInscripcionBD,
    listarInscripcionesUsuario,
    buscarCursoConBloqueo,
    buscarUsuarioConBloqueo
} from '../repositories/inscripcion.repository.js';

import {
    calcularProgreso,
    inicializarProgreso,
    obtenerProgresoCurso
} from './progreso.service.js';

import {
    buscarCursoConInstructor
} from '../repositories/curso.repository.js';

import { AppError } from '../utils/app-error.js';

export async function inscribirEstudiante(usuarioId, cursoId) {
    try {
        return await ejecutarTransaccion(async transaction => {
            const usuario = await buscarUsuarioConBloqueo(
                usuarioId,
                transaction
            );

            if (!usuario || usuario.rol !== 'estudiante') {
                throw new AppError(
                    403,
                    'FORBIDDEN',
                    'Solo los estudiantes pueden inscribirse en cursos'
                );
            }

            const curso = await buscarCursoConBloqueo(
                cursoId,
                transaction
            );

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
                    curso.estado === 'borrador'
                        ? 'No puedes inscribirte en un curso en borrador'
                        : 'No puedes inscribirte en un curso archivado'
                );
            }

            const existente = await buscarInscripcion(
                usuarioId,
                cursoId,
                transaction
            );

            if (existente) {
                throw new AppError(
                    409,
                    'ALREADY_ENROLLED',
                    'Ya estás inscrito en este curso'
                );
            }

            await crearInscripcionBD({
                usuarioId,
                cursoId,
                fechaInscripcion: new Date()
            }, transaction);

            return {
                mensaje: 'Inscripción realizada correctamente',
                curso: {
                    id: curso.id,
                    titulo: curso.titulo,
                    estado: curso.estado
                },
                progreso: await inicializarProgreso(
                    usuarioId,
                    cursoId
                )
            };
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            throw new AppError(
                409,
                'ALREADY_ENROLLED',
                'Ya estás inscrito en este curso'
            );
        }

        throw error;
    }
}

export async function consultarMisCursos(usuarioId) {
    const inscripciones = await listarInscripcionesUsuario(usuarioId);
    const cursos = [];

    for (const inscripcion of inscripciones) {
        const curso = inscripcion.curso;

        if (!curso) {
            continue;
        }

        const progreso = await calcularProgreso(
            usuarioId,
            curso.id
        );

        cursos.push({
            inscripcionId: inscripcion.id,
            fechaInscripcion: inscripcion.fechaInscripcion,
            curso: {
                id: curso.id,
                titulo: curso.titulo,
                descripcion: curso.descripcion,
                categoria: curso.categoria,
                nivel: curso.nivel,
                estado: curso.estado,
                instructor: curso.instructor
                    ? {
                        id: curso.instructor.id,
                        nombre: curso.instructor.nombre
                    }
                    : null
            },
            progreso: {
                totalLecciones: progreso.totalLecciones,
                leccionesCompletadas: progreso.leccionesCompletadas,
                porcentaje: progreso.porcentaje,
                estado: progreso.estado,
                leccionActualId: progreso.leccionActual?.id ?? null
            }
        });
    }

    return { cursos };
}

export async function consultarEstadoInscripcion(usuarioId, cursoId) {
    const inscripcion = await buscarInscripcion(
        usuarioId,
        cursoId
    );

    return { inscrito: Boolean(inscripcion) };
}

export async function consultarCursoInscrito(usuarioId, cursoId) {
    const curso = await buscarCursoConInstructor(cursoId);

    if (!curso) {
        throw new AppError(
            404,
            'COURSE_NOT_FOUND',
            'El curso no existe'
        );
    }

    const progreso = await obtenerProgresoCurso(
        usuarioId,
        cursoId
    );

    return {
        curso: {
            id: curso.id,
            titulo: curso.titulo,
            descripcion: curso.descripcion,
            categoria: curso.categoria,
            nivel: curso.nivel,
            estado: curso.estado,
            instructor: curso.instructor
                ? {
                    id: curso.instructor.id,
                    nombre: curso.instructor.nombre
                }
                : null
        },
        progreso,
        temario: [
            ...progreso.completadas.map(leccion => ({
                id: leccion.id,
                titulo: leccion.titulo,
                orden: leccion.orden,
                estado: 'completada'
            })),
            ...progreso.pendientes.map(leccion => ({
                id: leccion.id,
                titulo: leccion.titulo,
                orden: leccion.orden,
                estado: leccion.id === progreso.leccionActual?.id
                    ? 'actual'
                    : 'bloqueada'
            }))
        ].sort((a, b) => a.orden - b.orden)
    };
}
