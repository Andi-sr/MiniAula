import { z } from 'zod';

export const actualizarPerfilSchema = z.strictObject({

    nombre: z.string()
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede superar 100 caracteres')
        .optional(),

    email: z.string()
        .trim()
        .toLowerCase()
        .pipe(z.email('Correo electrónico inválido'))
        .optional()

}).refine(
    (datos) => Object.keys(datos).length > 0,
    {
        message: 'Debes proporcionar al menos un campo para actualizar'
    }
);
