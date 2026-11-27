import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { esSesionExpirada, interpretarError } from '../services/errores'
import {
  codigoVideoSeguro,
  liberarVideoAutorizado,
  obtenerVideoAutorizado
} from '../services/video.service'

const ESTADO_SIN_VIDEO = {
  url: '',
  cargando: false,
  error: null,
  avisoFormato: false
}

function interpretarErrorVideo(error) {
  const estado = Number(error?.response?.status) || 0
  const codigo = codigoVideoSeguro(error)
  const base = interpretarError(error, 'video')

  if (estado === 401 || esSesionExpirada(error)) {
    return {
      ...base,
      titulo: 'Sesión expirada',
      mensaje: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
      codigo,
      puedeReintentar: false,
      sesionExpirada: true
    }
  }

  if (estado === 403 && codigo === 'LESSON_LOCKED') {
    return {
      ...base,
      titulo: 'Lección bloqueada',
      mensaje: 'Debes completar la lección anterior para ver este video.',
      codigo,
      puedeReintentar: false
    }
  }

  if (estado === 403 && codigo === 'NOT_ENROLLED') {
    return {
      ...base,
      titulo: 'Curso no inscrito',
      mensaje: 'Debes inscribirte en el curso.',
      codigo,
      puedeReintentar: false
    }
  }

  if (estado === 403) {
    return {
      ...base,
      titulo: 'Sin permiso',
      mensaje: 'No tienes permiso para ver este video.',
      codigo,
      puedeReintentar: false
    }
  }

  if (estado === 404) {
    return {
      ...base,
      titulo: 'Video no disponible',
      mensaje: 'El video de esta lección no está disponible.',
      codigo,
      puedeReintentar: false
    }
  }

  if (!error?.response) {
    return {
      ...base,
      titulo: 'Sin conexión',
      mensaje: 'No pudimos conectar con el servidor para cargar el video.',
      codigo,
      puedeReintentar: true
    }
  }

  return { ...base, codigo }
}

export function useVideoAutorizado(videoPath) {
  const { cerrarSesion } = useAuth()
  const [intento, setIntento] = useState(0)
  const [estado, setEstado] = useState({
    clave: '',
    ...ESTADO_SIN_VIDEO
  })

  const clave = videoPath ? `${videoPath}|${intento}` : ''
  const estadoActual = estado.clave === clave
    ? estado
    : { ...ESTADO_SIN_VIDEO, cargando: Boolean(videoPath) }

  useEffect(() => {
    if (!videoPath) return undefined

    let activo = true
    let adquirido = false

    obtenerVideoAutorizado(videoPath)
      .then((url) => {
        adquirido = true

        if (!activo) {
          liberarVideoAutorizado(videoPath)
          return
        }

        setEstado({ clave, ...ESTADO_SIN_VIDEO, url })
      })
      .catch((error) => {
        if (!activo) return

        const errorInfo = interpretarErrorVideo(error)

        setEstado({ clave, ...ESTADO_SIN_VIDEO, error: errorInfo })

        if (errorInfo.sesionExpirada) {
          cerrarSesion()
        }
      })

    return () => {
      activo = false

      if (adquirido) {
        liberarVideoAutorizado(videoPath)
      }
    }
  }, [cerrarSesion, clave, videoPath])

  const reintentar = useCallback(() => {
    setIntento((valor) => valor + 1)
  }, [])

  const marcarErrorFormato = useCallback(() => {
    setEstado((actual) => {
      if (actual.clave !== clave || !actual.url || actual.error) return actual

      return {
        clave,
        ...ESTADO_SIN_VIDEO,
        error: {
          titulo: 'Formato no reproducible',
          mensaje: 'Tu navegador no puede reproducir este formato de video.',
          codigo: 'VIDEO_FORMAT_NOT_SUPPORTED',
          detalles: [],
          puedeReintentar: false
        }
      }
    })
  }, [clave])

  return { ...estadoActual, reintentar, marcarErrorFormato }
}
