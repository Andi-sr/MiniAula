
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const raizApi = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..'
);

function resolverDirectorioVideo() {
    const configurado = process.env.VIDEO_UPLOAD_DIR;

    if (!configurado) {
        return path.join(raizApi, 'uploads', 'videos');
    }

    return path.isAbsolute(configurado)
        ? configurado
        : path.resolve(raizApi, configurado);
}

export const VIDEO_DIRECTORY = resolverDirectorioVideo();

const maxConfigurado = Number(
    process.env.VIDEO_MAX_SIZE_MB || 100
);

export const VIDEO_MAX_MB =
    Number.isFinite(maxConfigurado) && maxConfigurado > 0
        ? maxConfigurado
        : 100;

export const VIDEO_MAX_BYTES = Math.floor(
    VIDEO_MAX_MB * 1024 * 1024
);

export const VIDEO_EXTENSIONS = new Set([
    '.mp4',
    '.webm',
    '.mov'
]);

export const VIDEO_MIME_TYPES = new Set([
    'video/mp4',
    'video/webm',
    'video/quicktime'
]);

export function asegurarDirectorioVideo() {
    fs.mkdirSync(VIDEO_DIRECTORY, { recursive: true });
}
