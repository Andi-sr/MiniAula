import { verificarToken } from '../config/jwt.js';
import { buscarPorId } from '../repositories/usuario.repository.js';
import { AppError } from '../utils/app-error.js';

// Verificar que el usuario haya iniciado sesión
export async function autenticar(req, res, next) {

    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        throw new AppError(
            401,
            'TOKEN_REQUIRED',
            'Debes iniciar sesión'
        );
    }

    const token = authorization.slice(7).trim();

    if (!token) {
        throw new AppError(
            401,
            'TOKEN_REQUIRED',
            'Debes enviar un token'
        );
    }

    let datosToken;

    try {
        datosToken = verificarToken(token);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError(
                401,
                'TOKEN_EXPIRED',
                'Tu sesión ha expirado'
            );
        }

        throw new AppError(
            401,
            'INVALID_TOKEN',
            'El token no es válido'
        );
    }

    // Nuestro jwt.js guarda el identificador en "id"
    const usuarioId = Number(datosToken.id);

    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new AppError(
            401,
            'INVALID_TOKEN',
            'El token no es válido'
        );
    }

    // Comprobar que el usuario todavía exista
    const usuario = await buscarPorId(usuarioId);

    if (!usuario) {
        throw new AppError(
            401,
            'USER_NOT_FOUND',
            'El usuario no existe'
        );
    }

    // Guardar los datos públicos en la petición
    req.usuario = usuario.toJSON();

    next();
}

// Verificar que el usuario tenga el rol permitido
export function autorizarRoles(...rolesPermitidos) {
    return (req, res, next) => {

        if (!req.usuario) {
            return next(new AppError(
                401,
                'UNAUTHORIZED',
                'Debes iniciar sesión'
            ));
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return next(new AppError(
                403,
                'FORBIDDEN',
                'No tienes permiso para realizar esta acción'
            ));
        }

        next();
    };
}
