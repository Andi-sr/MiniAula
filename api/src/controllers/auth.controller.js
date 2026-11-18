import {
    registrarUsuario,
    iniciarSesion
} from '../services/auth.service.js';

// Registrar un nuevo usuario
export async function registrar(req, res) {
    const resultado = await registrarUsuario(req.body);

    return res.status(201).json(resultado);
}

// Iniciar sesión
export async function login(req, res) {
    const resultado = await iniciarSesion(req.body);

    return res.status(200).json(resultado);
}


// Consultar los datos de la sesión actual
export function consultarSesion(req, res) {
    return res.status(200).json({
        usuario: req.usuario
    });
}

// Comprobar acceso de instructor
export function verificarInstructor(req, res) {
    return res.status(200).json({
        mensaje: 'Acceso autorizado para instructor',
        usuario: req.usuario
    });
}

