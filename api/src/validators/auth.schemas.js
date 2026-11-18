import { z } from 'zod';

// Validar correo electrónico
const emailSchema = z.string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Correo electrónico inválido'));

// Validar la contraseña del registro
const passwordSchema = z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .refine(
        (password) => Buffer.byteLength(password, 'utf8') <= 72,
        'La contraseña es demasiado larga'
    );

// Validación para registrar usuarios
export const registroSchema = z.strictObject({
    nombre: z.string()
        .trim()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede superar 100 caracteres'),

    email: emailSchema,

    password: passwordSchema,

    rol: z.enum(
        ['estudiante', 'instructor'],
        { error: 'El rol debe ser estudiante o instructor' }
    )
});

// Validación para iniciar sesión
export const loginSchema = z.strictObject({
    email: emailSchema,

    password: z.string()
        .min(1, 'La contraseña es obligatoria')
});
