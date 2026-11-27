import api from './api'

const NOMBRE_VIDEO_SEGURO = /^[A-Za-z0-9._-]+$/
const EXTENSION_VIDEO = /\.(mp4|webm|mov)$/i
const CODIGO_SEGURO = /^[A-Z][A-Z0-9_]{2,60}$/

const cacheVideos = new Map()

function extraerNombreVideo(videoPath) {
  const nombre = String(videoPath || '').split('/').pop().trim()

  if (
    !nombre ||
    !NOMBRE_VIDEO_SEGURO.test(nombre) ||
    !EXTENSION_VIDEO.test(nombre)
  ) {
    return ''
  }

  return nombre
}

function crearErrorVideo(mensaje, code) {
  const error = new Error(mensaje)
  error.code = code
  return error
}

async function adjuntarDetallesServidor(error) {
  const datos = error?.response?.data

  if (typeof Blob !== 'undefined' && datos instanceof Blob) {
    try {
      const texto = await datos.text()
      const cuerpo = JSON.parse(texto)

      error.mensajeServidor = cuerpo?.error?.message
      error.codigoServidor = cuerpo?.error?.code
      error.detallesServidor = cuerpo?.error?.details
    } catch {
      error.mensajeServidor = 'No se pudo cargar el video.'
    }

    return error
  }

  error.mensajeServidor =
    datos?.error?.message || datos?.mensaje || datos?.message
  error.codigoServidor = datos?.error?.code
  error.detallesServidor = datos?.error?.details

  return error
}

export async function obtenerVideoAutorizado(videoPath) {
  const nombre = extraerNombreVideo(videoPath)

  if (!nombre) {
    throw crearErrorVideo('La ruta del video no es válida.', 'INVALID_VIDEO_PATH')
  }

  let entrada = cacheVideos.get(nombre)

  if (!entrada) {
    entrada = { url: '', referencias: 0, promesa: null }
    cacheVideos.set(nombre, entrada)
  }

  entrada.referencias += 1

  if (entrada.url) {
    return entrada.url
  }

  if (!entrada.promesa) {
    entrada.promesa = api
      .get(`/videos/${encodeURIComponent(nombre)}`, { responseType: 'blob' })
      .then(({ data }) => {
        if (!data || data.size === 0) {
          throw crearErrorVideo('El video está vacío.', 'VIDEO_NOT_FOUND')
        }

        const url = URL.createObjectURL(data)

        if (cacheVideos.get(nombre) !== entrada) {
          URL.revokeObjectURL(url)
          throw crearErrorVideo('El video ya no está disponible.', 'VIDEO_STALE')
        }

        entrada.url = url
        return url
      })
      .catch(async (error) => {
        await adjuntarDetallesServidor(error)

        if (cacheVideos.get(nombre) === entrada) {
          cacheVideos.delete(nombre)
        }

        throw error
      })
      .finally(() => {
        entrada.promesa = null
      })
  }

  return entrada.promesa
}

export function liberarVideoAutorizado(videoPath) {
  const nombre = extraerNombreVideo(videoPath)
  const entrada = cacheVideos.get(nombre)

  if (!entrada) return

  entrada.referencias -= 1

  if (entrada.referencias <= 0) {
    cacheVideos.delete(nombre)

    if (entrada.url) {
      URL.revokeObjectURL(entrada.url)
    }
  }
}

export function codigoVideoSeguro(error) {
  const candidato =
    error?.codigoServidor ||
    error?.response?.data?.error?.code ||
    error?.code

  if (typeof candidato === 'string' && CODIGO_SEGURO.test(candidato)) {
    return candidato
  }

  return ''
}
