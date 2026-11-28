
import { Pregunta } from '../models/index.js';

// Registrar una pregunta en la base de datos.
export async function crearPreguntaBD(datos, transaction) {
    return await Pregunta.create(datos, { transaction });
}

// Buscar una pregunta por su identificador.
export async function buscarPreguntaPorId(id, transaction) {
    return await Pregunta.findByPk(id, { transaction });
}

// Listar las preguntas de una lección.
export async function listarPreguntasBD(leccionId, transaction) {
    return await Pregunta.findAll({
        where: { leccionId },
        order: [['orden', 'ASC']],
        transaction
    });
}

// Modificar una pregunta existente.
export async function actualizarPreguntaBD(
    pregunta,
    datos,
    transaction
) {
    return await pregunta.update(datos, { transaction });
}

// Eliminar una pregunta.
export async function eliminarPreguntaBD(pregunta, transaction) {
    return await pregunta.destroy({ transaction });
}
