
import multer from 'multer';
import path from 'node:path';

import {
    VIDEO_EXTENSIONS,
    VIDEO_MAX_BYTES,
    VIDEO_MAX_MB,
    VIDEO_MIME_TYPES,
    asegurarDirectorioVideo
} from '../config/uploads.js';

import { validarContenidoVideo } from '../utils/video.util.js';
import { AppError } from '../utils/app-error.js';
import { validarBody } from './validar.middleware.js';

const subida = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: VIDEO_MAX_BYTES,
        files: 1,
        fields: 10
    },
    fileFilter(req, archivo, callback) {
        const extension = path.extname(
            archivo.originalname || ''
        ).toLowerCase();
        const mime = String(archivo.mimetype || '').toLowerCase();

        if (!VIDEO_EXTENSIONS.has(extension) || !VIDEO_MIME_TYPES.has(mime)) {
            return callback(
                new AppError(
                    415,
                    'INVALID_VIDEO_FORMAT',
                    'Solo se permiten videos MP4, WebM o MOV'
                )
            );
        }

        return callback(null, true);
    }
});

export function recibirArchivoVideo(req, res, next) {
    subida.single('video')(req, res, error => {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return next(
                    new AppError(
                        413,
                        'VIDEO_TOO_LARGE',
                        `El video supera el límite de ${VIDEO_MAX_MB} MB`
                    )
                );
            }

            if (error.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(
                    new AppError(
                        422,
                        'INVALID_VIDEO_FIELD',
                        'El archivo debe enviarse en el campo "video"'
                    )
                );
            }

            return next(
                new AppError(
                    400,
                    'INVALID_UPLOAD',
                    'No se pudo recibir el archivo de video'
                )
            );
        }

        if (error) {
            return next(error);
        }

        if (!req.file) {
            req.archivoVideo = null;
            return next();
        }

        const validacion = validarContenidoVideo(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname
        );

        if (!validacion.valido) {
            return next(
                new AppError(
                    415,
                    'INVALID_VIDEO_CONTENT',
                    validacion.mensaje
                )
            );
        }

        asegurarDirectorioVideo();

        req.archivoVideo = {
            ...req.file,
            formato: validacion.formato,
            mimeTypeValidado: validacion.mimeType
        };

        return next();
    });
}

export function procesarFormularioLeccion(schema) {
    return (req, res, next) => {
        if (!req.is('multipart/form-data')) {
            return validarBody(schema)(req, res, next);
        }

        return recibirArchivoVideo(req, res, error => {
            if (error) {
                return next(error);
            }

            const resultado = schema.safeParse(req.body);

            if (!resultado.success) {
                return next(
                    new AppError(
                        422,
                        'VALIDATION_ERROR',
                        'Los datos de la lección no son válidos',
                        resultado.error.issues.map(issue => ({
                            campo: issue.path.join('.') || 'body',
                            mensaje: issue.message
                        }))
                    )
                );
            }

            req.datosLeccion = resultado.data;
            return next();
        });
    };
}
