import { z } from 'zod';

const camposCurso = z.strictObject({
    titulo: z.string().trim().min(3).max(150),
    descripcion: z.string().trim().min(10).max(2000),
    categoria: z.string().trim().min(2).max(100),
    nivel: z.string().trim().min(2).max(50)
});

export const crearCursoSchema = camposCurso;

export const editarCursoSchema = camposCurso
    .partial()
    .refine(
        (datos) => Object.keys(datos).length > 0,
        { message: 'Debes enviar al menos un campo' }
    );

export const cursoIdSchema = z.strictObject({
    id: z.coerce.number().int().positive()
});

export const listarCursosSchema = z.strictObject({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
});


export const cambiarEstadoSchema = z.strictObject({
    estado: z.enum(['publicado', 'archivado'])
});

export const catalogoCursosSchema = z.strictObject({
    q: z.string().trim().max(150).optional(),

    categoria: z.string().trim().max(100).optional(),

    page: z.coerce.number()
        .int()
        .positive()
        .default(1),

    limit: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(10)
});

