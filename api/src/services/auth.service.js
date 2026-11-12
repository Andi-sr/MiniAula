import bcrypt from 'bcrypt';

import { AppError } from '../utils/app-error.js';

import { generarToken } from '../config/jwt.js';

import {
    buscarPorEmail,
    crearUsuario
} from '../repositories/usuario.repository.js';


// Devolver solamente información pública
function datosPublicos(usuario) {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        creadoEn: usuario.creadoEn
    };
}


// REGISTRO DE USUARIOS
export async function registrarUsuario(datos) {

    const { nombre, email, password, rol } = datos;

    // Comprobar si el correo ya está registrado
    const usuarioExistente = await buscarPorEmail(email);

    if (usuarioExistente) {
        throw new AppError(
            409,
            'EMAIL_EXISTS',
            'El correo electrónico ya está registrado'
        );
    }

    // Proteger la contraseña utilizando bcrypt
    const passwordHash = await bcrypt.hash(password, 12);

    // Guardar el usuario en MySQL
    const usuario = await crearUsuario({
        nombre,
        email,
        passwordHash,
        rol
    });

    // Generar el token
    const token = generarToken(usuario.id);

    // Devolver la información al cliente
    return {
        mensaje: 'Usuario registrado correctamente',
        usuario: datosPublicos(usuario),
        token: token
    };
}


// INICIO DE SESIÓN
export async function iniciarSesion(datos) {

    const { email, password } = datos;

    // Buscar el usuario en MySQL
    const usuario = await buscarPorEmail(email);

    // Utilizar un mensaje genérico para credenciales incorrectas
    if (!usuario) {
        throw new AppError(
            401,
            'INVALID_CREDENTIALS',
            'Correo o contraseña incorrectos'
        );
    }

    // Comparar la contraseña con el hash almacenado
    const passwordCorrecta = await bcrypt.compare(
        password,
        usuario.passwordHash
    );

    if (!passwordCorrecta) {
        throw new AppError(
            401,
            'INVALID_CREDENTIALS',
            'Correo o contraseña incorrectos'
        );
    }

    // Crear token para la sesión
    const token = generarToken(usuario.id);

    return {
        mensaje: 'Sesión iniciada correctamente',
        usuario: datosPublicos(usuario),
        token: token
    };
}
