import api from './api'

const LIMITE_PAGINADO = 100

export async function listarCursosInstructor({ page = 1, limit = 10 } = {}) {
  const { data } = await api.get('/instructor/cursos', {
    params: { page, limit }
  })

  return {
    cursos: data.cursos || [],
    total: data.total || 0,
    page: data.page || page,
    limit: data.limit || limit,
    totalPages: data.totalPages || 1
  }
}

export async function listarTodosCursosInstructor() {
  const primeraPagina = await listarCursosInstructor({
    page: 1,
    limit: LIMITE_PAGINADO
  })

  const cursos = [...primeraPagina.cursos]
  const totalPaginas = primeraPagina.totalPages || 1

  if (totalPaginas > 1) {
    const paginasRestantes = await Promise.all(
      Array.from({ length: totalPaginas - 1 }, (_, indice) =>
        listarCursosInstructor({
          page: indice + 2,
          limit: LIMITE_PAGINADO
        })
      )
    )

    paginasRestantes.forEach((pagina) => cursos.push(...pagina.cursos))
  }

  return {
    cursos,
    total: primeraPagina.total || cursos.length
  }
}

export async function buscarCursoInstructor(id) {
  const { cursos } = await listarTodosCursosInstructor()
  return cursos.find((curso) => Number(curso.id) === Number(id)) || null
}

export function crearCurso(datos) {
  return api.post('/cursos', datos)
}

export function editarCurso(id, datos) {
  return api.put(`/cursos/${id}`, datos)
}

export function cambiarEstadoCurso(id, estado) {
  return api.patch(`/cursos/${id}/estado`, { estado })
}

export function eliminarCurso(id) {
  return api.delete(`/cursos/${id}`)
}

export async function listarLeccionesCurso(cursoId) {
  const { data } = await api.get(`/instructor/cursos/${cursoId}/lecciones`)
  return data.lecciones || []
}

export async function obtenerLeccionInstructor(cursoId, leccionId) {
  const { data } = await api.get(
    `/instructor/cursos/${cursoId}/lecciones/${leccionId}`
  )
  return data.leccion
}

export function crearLeccion(cursoId, datos, archivoVideo) {
  if (archivoVideo) {
    const formData = new FormData()
    formData.append('titulo', datos.titulo)
    formData.append('contenido', datos.contenido)
    formData.append('video', archivoVideo)

    return api.post(`/cursos/${cursoId}/lecciones`, formData)
  }

  return api.post(`/cursos/${cursoId}/lecciones`, {
    titulo: datos.titulo,
    contenido: datos.contenido
  })
}

export function editarLeccion(leccionId, datos, { archivoVideo, quitarVideo } = {}) {
  if (archivoVideo) {
    const formData = new FormData()
    formData.append('titulo', datos.titulo)
    formData.append('contenido', datos.contenido)
    formData.append('video', archivoVideo)

    return api.put(`/lecciones/${leccionId}`, formData)
  }

  const cuerpo = {
    titulo: datos.titulo,
    contenido: datos.contenido
  }

  if (quitarVideo) {
    cuerpo.videoPath = null
  }

  return api.put(`/lecciones/${leccionId}`, cuerpo)
}

export function eliminarLeccion(leccionId) {
  return api.delete(`/lecciones/${leccionId}`)
}

export function reordenarLecciones(cursoId, leccionIds) {
  return api.patch(`/cursos/${cursoId}/lecciones/orden`, { leccionIds })
}

export { obtenerVideoAutorizado, liberarVideoAutorizado } from './video.service'
