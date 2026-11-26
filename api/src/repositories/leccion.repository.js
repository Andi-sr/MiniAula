import { Curso, Leccion } from '../models/index.js';

export async function crearLeccionBD(datos, transaction) {
    return await Leccion.create(datos, { transaction });
}

export async function buscarLeccionPorId(id, transaction) {
    return await Leccion.findByPk(id, { transaction });
}

export async function listarLeccionesBD(cursoId, transaction) {
    return await Leccion.findAll({
        where: { cursoId },
        order: [['orden', 'ASC']],
        transaction
    });
}

export async function actualizarLeccionBD(
    leccion,
    datos,
    transaction
) {
    return await leccion.update(datos, { transaction });
}

export async function eliminarLeccionBD(leccion, transaction) {
    return await leccion.destroy({ transaction });
}

export async function ejecutarConCursoBloqueado(
    cursoId,
    ejecutar
) {
    return await Curso.sequelize.transaction(
        async transaction => {
            const curso = await Curso.findByPk(cursoId, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            return await ejecutar(curso, transaction);
        }
    );
}

export async function reordenarLeccionesBD(
    lecciones,
    ids,
    transaction
) {
    const porId = new Map(
        lecciones.map(leccion => [
            Number(leccion.id),
            leccion
        ])
    );

    const maxOrden = Math.max(
        0,
        ...lecciones.map(leccion => Number(leccion.orden))
    );

    for (let i = 0; i < ids.length; i++) {
        await porId.get(ids[i]).update({
            orden: maxOrden + i + 1
        }, { transaction });
    }

    for (let i = 0; i < ids.length; i++) {
        await porId.get(ids[i]).update({
            orden: i + 1
        }, { transaction });
    }
}
