
import {
    crearNuevaLeccion,
    obtenerLeccionesCurso,
    modificarLeccion,
    borrarLeccion,
    cambiarOrdenLecciones
} from '../services/leccion.service.js';

import {
    serializarLeccion
} from '../utils/leccion.serializer.js';

export async function crearLeccion(req, res) {
    const leccion = await crearNuevaLeccion(
        req.cursoId,
        req.datosLeccion ?? req.body,
        req.archivoVideo ?? null
    );

    return res.status(201).json({
        mensaje: 'Leccion creada correctamente',
        leccion
    });
}

export async function consultarLeccionInstructor(req, res) {
    return res.status(200).json({
        leccion: serializarLeccion(req.leccion)
    });
}

export async function consultarLecciones(req, res) {
    const lecciones = await obtenerLeccionesCurso(
        req.cursoId
    );

    return res.status(200).json({ lecciones });
}

export async function editarLeccion(req, res) {
    const leccion = await modificarLeccion(
        req.cursoId,
        req.leccionId,
        req.datosLeccion ?? req.body,
        req.archivoVideo ?? null
    );

    return res.status(200).json({
        mensaje: 'Leccion actualizada correctamente',
        leccion
    });
}

export async function eliminarLeccion(req, res) {
    await borrarLeccion(
        req.cursoId,
        req.leccionId
    );

    return res.status(204).send();
}

export async function reordenarLecciones(req, res) {
    const lecciones = await cambiarOrdenLecciones(
        req.cursoId,
        req.body.leccionIds
    );

    return res.status(200).json({
        mensaje: 'Lecciones reordenadas correctamente',
        lecciones
    });
}
