import { Usuario } from '../models/index.js';

// Buscar un usuario por su correo electrónico
export async function buscarPorEmail(email) {
    return await Usuario.findOne({
        where: {
            email: email
        }
    });
}

// Registrar un nuevo usuario en MySQL
export async function crearUsuario(datos) {
    return await Usuario.create(datos);
}

// Buscar un usuario por su identificador
export async function buscarPorId(id) {
    return await Usuario.findByPk(id, {
        attributes: [
            'id',
            'nombre',
            'email',
            'rol',
            'creadoEn'
        ]
    });
}

export async function actualizarUsuarioPorId(id, datos) {

    // Buscar al usuario en MySQL
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
        return null;
    }
    const cambios = {};

    if (datos.nombre !== undefined) {
        cambios.nombre = datos.nombre;
    }

    if (datos.email !== undefined) {
        cambios.email = datos.email;
    }
    await usuario.update(cambios);
    return await buscarPorId(id);
}

