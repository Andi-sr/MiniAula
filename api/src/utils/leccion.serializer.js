
export function serializarLeccion(leccion) {
    return {
        id: leccion.id,
        titulo: leccion.titulo,
        tipo: leccion.tipo,
        contenido: leccion.contenido,
        videoPath: leccion.videoPath || null,
        orden: leccion.orden,
        notaMinima: leccion.notaMinima,
        cursoId: leccion.cursoId
    };
}

export function serializarLecciones(lecciones) {
    return lecciones.map(serializarLeccion);
}
