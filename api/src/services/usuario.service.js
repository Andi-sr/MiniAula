import {
    buscarPorId,
    buscarPorEmail,
    actualizarUsuarioPorId
} from '../repositories/usuario.repository.js';

import { AppError } from '../utils/app-error.js';
// Obtener el perfil del usuario autenticado
export async function obtenerMiPerfil(usuarioId) {
    const usuario = await buscarPorId(usuarioId);
    if (!usuario) {
        throw new AppError(
            404,
            'USER_NOT_FOUND',
            'El usuario no existe'
        );
    }
    return usuario;
}

export async function actualizarMiPerfil(usuarioId, datos) {
    // Buscar al usuario que está intentando actualizar su perfil
    const usuario = await buscarPorId(usuarioId);
    if (!usuario) {
        throw new AppError(
            404,
            'USER_NOT_FOUND',
            'El usuario no existe'
        );
    }
    if (datos.email !== undefined && datos.email !== usuario.email) {
        const usuarioConCorreo = await buscarPorEmail(datos.email);

        if (usuarioConCorreo) {
            throw new AppError(
                409,
                'EMAIL_EXISTS',
                'El correo electrónico ya está registrado'
            );
        }
    }

    const usuarioActualizado = await actualizarUsuarioPorId(
        usuarioId,
        datos
    );

    return {
        mensaje: 'Perfil actualizado correctamente',
        usuario: usuarioActualizado
    };
}

