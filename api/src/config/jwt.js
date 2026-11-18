import jwt from 'jsonwebtoken';

// Generar token para el usuario
export function generarToken(usuarioId) {
    return jwt.sign(
        { id: usuarioId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );
}

// Verificar si un token es valido
export function verificarToken(token) {
    return jwt.verify(
        token,
        process.env.JWT_SECRET,
        { algorithms: ['HS256'] }
    );
}
