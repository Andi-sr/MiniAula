import { z } from 'zod';

const camposTextoLeccion = {
    titulo: z.string().trim().min(3).max(150),

    contenido: z.string().trim().min(1)
};

const videoPathSchema = z.preprocess(
    valor => valor === '' || valor === 'null' ? null : valor,
    z.null().optional()
);

export const crearLeccionSchema = z.strictObject({
    ...camposTextoLeccion,
    tipo: z.literal('contenido').default('contenido'),
    videoPath: videoPathSchema
});

export const editarLeccionSchema = z
    .strictObject({
        ...camposTextoLeccion,
        videoPath: videoPathSchema
    })
    .partial()
    .refine(
        datos => Object.keys(datos).length > 0,
        { message: 'Debes enviar al menos un campo' }
    );

export const leccionIdSchema = z.strictObject({
    id: z.coerce.number().int().positive()
});

export const leccionRutaSchema = z.object({
    leccionId: z.coerce.number().int().positive()
});

export const reordenarLeccionesSchema = z.strictObject({
    leccionIds: z.array(
        z.number().int().positive()
    ).min(1).refine(
        ids => new Set(ids).size === ids.length,
        { message: 'No puedes repetir lecciones' }
    )
});
