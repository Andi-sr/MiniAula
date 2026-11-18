import { z } from 'zod';

const camposLeccion = {
    titulo: z.string().trim().min(3).max(150),

    contenido: z.string().trim().min(1),

    videoUrl: z.string()
        .trim()
        .max(500)
        .url()
        .refine(url => /^https?:\/\//i.test(url), {
            message: 'El video debe tener una URL HTTP o HTTPS'
        })
        .nullable()
        .optional()
};

export const crearLeccionSchema = z.strictObject({
    ...camposLeccion,
    tipo: z.literal('contenido').default('contenido')
});

export const editarLeccionSchema = z
    .strictObject(camposLeccion)
    .partial()
    .refine(
        datos => Object.keys(datos).length > 0,
        { message: 'Debes enviar al menos un campo' }
    );

export const leccionIdSchema = z.strictObject({
    id: z.coerce.number().int().positive()
});

export const reordenarLeccionesSchema = z.strictObject({
    leccionIds: z.array(
        z.number().int().positive()
    ).min(1).refine(
        ids => new Set(ids).size === ids.length,
        { message: 'No puedes repetir lecciones' }
    )
});
