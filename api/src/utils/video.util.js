
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
    VIDEO_DIRECTORY,
    VIDEO_EXTENSIONS,
    asegurarDirectorioVideo
} from '../config/uploads.js';

import { AppError } from './app-error.js';

const NOMBRE_VIDEO_SEGURO =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9._-]{1,80}\.(mp4|webm|mov)$/i;

const RUTA_VIDEO_SEGURA =
    /^videos\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9._-]{1,80}\.(mp4|webm|mov))$/i;

function detectarFormato(buffer) {
    if (buffer.length >= 12) {
        const marca = buffer.toString('ascii', 4, 8);
        const contenedor = buffer.toString('ascii', 8, 12);

        if (marca === 'ftyp') {
            if (contenedor === 'qt  ') {
                return 'mov';
            }

            return 'mp4';
        }
    }

    if (
        buffer.length >= 4 &&
        buffer[0] === 0x1a &&
        buffer[1] === 0x45 &&
        buffer[2] === 0xdf &&
        buffer[3] === 0xa3
    ) {
        return 'webm';
    }

    return null;
}

export function validarContenidoVideo(buffer, mimeType, nombreOriginal) {
    if (!buffer || buffer.length === 0) {
        return {
            valido: false,
            mensaje: 'El archivo de video está vacío'
        };
    }

    const extension = path.extname(nombreOriginal || '').toLowerCase();

    if (!VIDEO_EXTENSIONS.has(extension)) {
        return {
            valido: false,
            mensaje: 'Solo se permiten archivos MP4, WebM o MOV'
        };
    }

    const formato = detectarFormato(buffer);

    if (!formato) {
        return {
            valido: false,
            mensaje: 'El archivo no tiene un formato de video válido'
        };
    }

    const extensionSinPunto = extension.slice(1);
    const mime = String(mimeType || '').toLowerCase();

    const combinacionesValidas =
        (formato === 'mp4' &&
            extensionSinPunto === 'mp4' &&
            mime === 'video/mp4') ||
        (formato === 'mov' &&
            extensionSinPunto === 'mov' &&
            ['video/quicktime', 'video/mp4'].includes(mime)) ||
        (formato === 'webm' &&
            extensionSinPunto === 'webm' &&
            mime === 'video/webm');

    if (!combinacionesValidas) {
        return {
            valido: false,
            mensaje:
                'La extensión, el tipo MIME y el contenido del archivo no coinciden'
        };
    }

    return {
        valido: true,
        formato,
        extension,
        mimeType: mime
    };
}

export function generarNombreVideo(nombreOriginal) {
    const nombreLimpio = String(nombreOriginal || 'video')
        .replace(/\\/g, '/')
        .split('/')
        .pop();

    const extension = path.extname(nombreLimpio).toLowerCase();

    if (!VIDEO_EXTENSIONS.has(extension)) {
        throw new AppError(
            415,
            'INVALID_VIDEO_FORMAT',
            'Solo se permiten videos MP4, WebM o MOV'
        );
    }

    const baseSegura = nombreLimpio
        .slice(0, nombreLimpio.length - extension.length)
        .replace(/[^A-Za-z0-9._-]/g, '_')
        .replace(/^\.+/, '')
        .slice(0, 80) || 'video';

    return `${crypto.randomUUID()}-${baseSegura}${extension}`;
}

export function esNombreVideoSeguro(nombre) {
    return NOMBRE_VIDEO_SEGURO.test(nombre || '');
}

export function nombreDesdeRutaVideo(videoPath) {
    const coincidencia = RUTA_VIDEO_SEGURA.exec(videoPath || '');
    return coincidencia ? coincidencia[1] : null;
}

export function rutaRelativaVideo(nombre) {
    return `videos/${nombre}`;
}

export function rutaAbsolutaSegura(rutaRelativa) {
    const nombre = nombreDesdeRutaVideo(rutaRelativa);

    if (!nombre) {
        return null;
    }

    const abs = path.resolve(VIDEO_DIRECTORY, nombre);
    const raiz = path.resolve(VIDEO_DIRECTORY) + path.sep;

    if (!abs.startsWith(raiz)) {
        return null;
    }

    return abs;
}

export async function guardarVideoEnDisco(buffer, nombre) {
    if (!esNombreVideoSeguro(nombre)) {
        throw new AppError(
            422,
            'INVALID_VIDEO_NAME',
            'El nombre del video no es válido'
        );
    }

    asegurarDirectorioVideo();

    const destino = path.join(VIDEO_DIRECTORY, nombre);

    try {
        await fs.promises.writeFile(destino, buffer, { flag: 'wx' });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            await fs.promises.unlink(destino).catch(() => {});
        }

        throw error;
    }

    return destino;
}

export async function eliminarArchivoAbsoluto(rutaAbsoluta) {
    if (!rutaAbsoluta) {
        return;
    }

    try {
        await fs.promises.unlink(rutaAbsoluta);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('No se pudo eliminar el archivo de video:', error);
        }
    }
}

export async function eliminarVideoDelDisco(rutaRelativa) {
    await eliminarArchivoAbsoluto(rutaAbsolutaSegura(rutaRelativa));
}

export async function prepararEliminacionVideo(rutaRelativa) {
    const origen = rutaAbsolutaSegura(rutaRelativa);

    if (!origen) {
        return null;
    }

    try {
        await fs.promises.access(origen);
    } catch {
        return null;
    }

    const temporal = `${origen}.tmp-${crypto.randomUUID()}`;
    await fs.promises.rename(origen, temporal);
    return temporal;
}

export async function restaurarVideoTemporal(temporal, rutaRelativa) {
    const destino = rutaAbsolutaSegura(rutaRelativa);

    if (!temporal || !destino) {
        return;
    }

    try {
        await fs.promises.access(temporal);
        await fs.promises.rename(temporal, destino);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('No se pudo restaurar el video:', error);
        }
    }
}
