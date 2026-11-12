
import {
    obtenerMiPerfil,
    actualizarMiPerfil
} from '../services/usuario.service.js';

export async function consultarMiPerfil(req, res) {
    const usuarioId = req.usuario.id;
    const perfil = await obtenerMiPerfil(usuarioId);

    return res.status(200).json({
        usuario: perfil
    });
}

export async function editarMiPerfil(req, res) {
    const usuarioId = req.usuario.id;
    const resultado = await actualizarMiPerfil(
        usuarioId,
        req.body
    );

    return res.status(200).json(resultado);
}
