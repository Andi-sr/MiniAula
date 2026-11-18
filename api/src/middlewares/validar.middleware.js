import { AppError } from '../utils/app-error.js';

export function validarBody(schema) {
    return (req, res, next) => {

        // Comprobar los datos recibidos
        const resultado = schema.safeParse(req.body);

        // Si los datos son incorrectos
        if (!resultado.success) {

            const errores = resultado.error.issues.map((issue) => ({
                campo: issue.path.join('.') || 'body',
                mensaje: issue.message
            }));

            return next(
                new AppError(
                    422,
                    'VALIDATION_ERROR',
                    'Los datos ingresados no son válidos',
                    errores
                )
            );
        }

        // Utilizar los datos validados
        req.body = resultado.data;

        // Continuar hacia el controlador
        next();
    };
}
