
import {
    crearPregunta,
    obtenerPreguntas,
    modificarPregunta,
    borrarPregunta,
    reordenarPreguntas
} from '../services/cuestionario.service.js';

export async function registrarPregunta(req, res) {
    const pregunta = await crearPregunta(
        req.leccionId,
        req.body
    );

    return res.status(201).json({
        mensaje: 'Pregunta creada correctamente',
        pregunta
    });
}

export async function consultarPreguntas(req, res) {
    const preguntas = await obtenerPreguntas(
        req.leccionId
    );

    return res.status(200).json({ preguntas });
}

export async function actualizarPregunta(req, res) {
    const pregunta = await modificarPregunta(
        req.preguntaId,
        req.body
    );

    return res.status(200).json({
        mensaje: 'Pregunta actualizada correctamente',
        pregunta
    });
}

export async function eliminarPregunta(req, res) {
    await borrarPregunta(req.preguntaId);

    return res.status(204).send();
}

export async function cambiarOrdenPreguntas(req, res) {
    const preguntas = await reordenarPreguntas(
        req.leccionId,
        req.body.preguntaIds
    );

    return res.status(200).json({
        mensaje: 'Preguntas reordenadas correctamente',
        preguntas
    });
}
