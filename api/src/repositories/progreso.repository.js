
import { Leccion, Progreso } from '../models/index.js';

export function ejecutarTransaccion(callback) {
    return Progreso.sequelize.transaction(callback);
}

export async function listarLeccionesContenido(cursoId, transaction) {
    return await Leccion.findAll({
        where: { cursoId, tipo: 'contenido' },
        order: [['orden', 'ASC']],
        transaction
    });
}

export async function buscarLeccionPorId(leccionId, transaction) {
    return await Leccion.findByPk(leccionId, { transaction });
}

export async function buscarLeccionPorVideoPath(videoPath) {
    return await Leccion.findOne({
        where: { videoPath }
    });
}

export async function listarProgresosCompletados(
    usuarioId,
    cursoId,
    transaction
) {
    return await Progreso.findAll({
        where: {
            usuarioId,
            cursoId,
            estado: 'completada'
        },
        order: [['fechaFinalizacion', 'ASC']],
        transaction
    });
}

export async function buscarProgreso(
    usuarioId,
    leccionId,
    transaction
) {
    return await Progreso.findOne({
        where: { usuarioId, leccionId },
        transaction
    });
}

export async function guardarProgresoBD(datos, transaction) {
    return await Progreso.create(datos, { transaction });
}

export async function actualizarProgresoBD(progreso, datos, transaction) {
    return await progreso.update(datos, { transaction });
}
