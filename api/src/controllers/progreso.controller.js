
import path from 'node:path';

import {
    obtenerProgresoCurso,
    verificarAccesoLeccion,
    obtenerLeccionAprendizaje,
    completarLeccion
} from '../services/progreso.service.js';

import {
    buscarLeccionPorVideoPath
} from '../repositories/progreso.repository.js';

import {
    buscarCursoPorId
} from '../repositories/curso.repository.js';

import {
    rutaAbsolutaSegura,
    rutaRelativaVideo
} from '../utils/video.util.js';

import { AppError } from '../utils/app-error.js';

export async function consultarProgreso(req, res) {
    const progreso = await obtenerProgresoCurso(
        req.usuario.id,
        req.cursoId
    );

    return res.status(200).json(progreso);
}

export async function consultarLeccionesProgreso(req, res) {
    const progreso = await obtenerProgresoCurso(
        req.usuario.id,
        req.cursoId
    );

    return res.status(200).json({
        completadas: progreso.completadas,
        pendientes: progreso.pendientes,
        bloqueadas: progreso.bloqueadas,
        actual: progreso.leccionActual
    });
}

export async function consultarPorcentaje(req, res) {
    const progreso = await obtenerProgresoCurso(
        req.usuario.id,
        req.cursoId
    );

    return res.status(200).json({
        cursoId: progreso.cursoId,
        porcentaje: progreso.porcentaje,
        leccionesCompletadas: progreso.leccionesCompletadas,
        totalLecciones: progreso.totalLecciones,
        estado: progreso.estado
    });
}

export async function obtenerLeccion(req, res) {
    const resultado = await obtenerLeccionAprendizaje(
        req.usuario.id,
        req.cursoId,
        req.leccionId
    );

    return res.status(200).json(resultado);
}

export async function marcarCompletada(req, res) {
    const resultado = await completarLeccion(
        req.usuario.id,
        req.cursoId,
        req.leccionId
    );

    return res.status(200).json(resultado);
}

export async function servirVideoAutorizado(req, res) {
    const videoPath = rutaRelativaVideo(req.params.archivo);
    const leccion = await buscarLeccionPorVideoPath(videoPath);

    if (!leccion || !leccion.videoPath) {
        throw new AppError(
            404,
            'VIDEO_NOT_FOUND',
            'El video solicitado no existe'
        );
    }

    const curso = await buscarCursoPorId(leccion.cursoId);

    if (!curso) {
        throw new AppError(
            404,
            'COURSE_NOT_FOUND',
            'El curso del video no existe'
        );
    }

    const esInstructorPropietario =
        req.usuario.rol === 'instructor' &&
        Number(curso.instructorId) === Number(req.usuario.id);

    if (!esInstructorPropietario) {
        if (req.usuario.rol !== 'estudiante') {
            throw new AppError(
                403,
                'FORBIDDEN',
                'No tienes permiso para ver este video'
            );
        }

        await verificarAccesoLeccion(
            req.usuario.id,
            curso.id,
            leccion.id
        );
    }

    const rutaAbsoluta = rutaAbsolutaSegura(leccion.videoPath);

    if (!rutaAbsoluta) {
        throw new AppError(
            404,
            'VIDEO_NOT_FOUND',
            'El video solicitado no existe'
        );
    }

    const mimeTypes = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mov': 'video/quicktime'
    };

    res.setHeader(
        'Content-Type',
        mimeTypes[path.extname(rutaAbsoluta).toLowerCase()] ||
            'application/octet-stream'
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');

    return res.sendFile(rutaAbsoluta);
}
