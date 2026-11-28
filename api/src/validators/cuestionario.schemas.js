import { z } from 'zod';

// Validación de los datos de una pregunta.
const camposPregunta = {
    enunciado: z.string()
        .trim()
        .min(5, 'La pregunta debe tener al menos 5 caracteres')
        .max(1000, 'La pregunta es demasiado larga'),

    opciones: z.array(
        z.string()
            .trim()
            .min(1, 'Las opciones no pueden estar vacías')
            .max(300, 'Una opción es demasiado larga')
    )
        .min(2, 'Debes registrar al menos 2 opciones')
        .max(6, 'Puedes registrar como máximo 6 opciones'),

    correcta: z.number()
        .int('La respuesta correcta debe ser un número entero')
        .min(0, 'El índice de respuesta no es válido')
};

export const crearPreguntaSchema = z.strictObject({
    ...camposPregunta
}).refine(
    datos => datos.correcta < datos.opciones.length,
    {
        message: 'La respuesta correcta debe corresponder a una de las opciones',
        path: ['correcta']
    }
);

export const editarPreguntaSchema = z.strictObject({
    ...camposPregunta
}).partial()
.refine(
    datos => Object.keys(datos).length > 0,
    {
        message: 'Debes enviar al menos un campo para actualizar'
    }
)
.refine(
    datos => {
        if (datos.correcta === undefined || datos.opciones === undefined) {
            return true;
        }

        return datos.correcta < datos.opciones.length;
    },
    {
        message: 'La respuesta correcta debe corresponder a una de las opciones',
        path: ['correcta']
    }
);

// Validación del identificador de una lección.
export const leccionCuestionarioIdSchema = z.strictObject({
    id: z.coerce.number().int().positive()
});

// Validación del identificador de una pregunta.
export const preguntaIdSchema = z.strictObject({
    preguntaId: z.coerce.number().int().positive()
});

// Validación para cambiar el orden de las preguntas.
export const reordenarPreguntasSchema = z.strictObject({
    preguntaIds: z.array(
        z.number().int().positive()
    )
        .min(1, 'Debes indicar al menos una pregunta')
        .refine(
            ids => new Set(ids).size === ids.length,
            {
                message: 'No puedes repetir preguntas'
            }
        )
});
