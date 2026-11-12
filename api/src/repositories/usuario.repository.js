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
