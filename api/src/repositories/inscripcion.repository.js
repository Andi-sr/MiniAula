
import { Inscripcion, Curso, Usuario } from '../models/index.js';

export function ejecutarTransaccion(callback) {
    return Inscripcion.sequelize.transaction(callback);
}

export async function buscarInscripcion(
    usuarioId,
    cursoId,
    transaction,
    bloquear = false
) {
    return await Inscripcion.findOne({
        where: { usuarioId, cursoId },
        transaction,
        lock: bloquear ? transaction.LOCK.UPDATE : undefined
    });
}

export async function crearInscripcionBD(datos, transaction) {
    return await Inscripcion.create(datos, { transaction });
}

export async function listarInscripcionesUsuario(usuarioId) {
    return await Inscripcion.findAll({
        where: { usuarioId },
        include: [
            {
                model: Curso,
                as: 'curso',
                include: [
                    {
                        model: Usuario,
                        as: 'instructor',
                        attributes: ['id', 'nombre', 'email']
                    }
                ]
            }
        ],
        order: [['fechaInscripcion', 'DESC']]
    });
}

export async function buscarCursoConBloqueo(cursoId, transaction) {
    return await Curso.findByPk(cursoId, {
        transaction,
        lock: transaction.LOCK.UPDATE
    });
}

export async function buscarUsuarioConBloqueo(usuarioId, transaction) {
    return await Usuario.findByPk(usuarioId, {
        transaction,
        lock: transaction.LOCK.UPDATE
    });
}
