const CODIGO_SEGURO = /^[A-Z][A-Z0-9_]{2,60}$/
const TEXTO_SOSPECHOSO = /[A-Za-z]:\\|\\|https?:\/\/|\/api\/|\.js:|select\s|insert\s|update\s|delete\s+from|bearer\s|eyJ/i

const CONTEXTOS = {
  general: {
    titulo: 'No se pudo completar la acción',
    mensaje: 'No se pudo completar la operación. Inténtalo nuevamente.'
  },
  login: {
    titulo: 'No se pudo iniciar sesión',
    mensaje: 'No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.'
  },
  registro: {
    titulo: 'No se pudo crear la cuenta',
    mensaje: 'Revisa los datos del formulario e inténtalo nuevamente.'
  },
  perfil: {
    titulo: 'No se pudo actualizar el perfil',
    mensaje: 'Revisa tus datos e inténtalo nuevamente.'
  },
  curso: {
    titulo: 'No se pudo completar la acción',
    mensaje: 'No se pudo trabajar con el curso. Inténtalo nuevamente.'
  },
  leccion: {
    titulo: 'No se pudo completar la acción',
    mensaje: 'No se pudo trabajar con la lección. Inténtalo nuevamente.'
  },
  video: {
    titulo: 'No se pudo procesar el video',
    mensaje: 'Selecciona un archivo MP4, WebM o MOV válido.'
  },
  carga: {
    titulo: 'No se pudo cargar la información',
    mensaje: 'No pudimos cargar la información. Inténtalo nuevamente.'
  },
  accion: {
    titulo: 'No se pudo completar la acción',
    mensaje: 'No se pudo completar la operación. Inténtalo nuevamente.'
  }
}

function limpiarTexto(valor) {
  if (typeof valor !== 'string') return ''

  const texto = valor.trim()

  if (!texto || texto.length > 220 || TEXTO_SOSPECHOSO.test(texto)) {
    return ''
  }

  return texto
}

function mensajeServidor(error) {
  const datos = error?.response?.data

  return limpiarTexto(
    error?.mensajeServidor ||
    datos?.error?.message ||
    datos?.mensaje ||
    datos?.message
  )
}

function codigoSeguro(error) {
  const candidato =
    error?.codigoServidor ||
    error?.response?.data?.error?.code ||
    error?.code

  if (typeof candidato === 'string' && CODIGO_SEGURO.test(candidato)) {
    return candidato.slice(0, 60)
  }

  if (error?.response?.status >= 500) {
    return 'INTERNAL_ERROR'
  }

  return ''
}

export function obtenerDetallesCampo(error) {
  const datos =
    error?.detallesServidor ||
    error?.response?.data?.error?.details

  if (!Array.isArray(datos)) {
    return []
  }

  return datos
    .map((detalle) => ({
      campo: limpiarTexto(detalle?.campo || detalle?.field || '').slice(0, 60),
      mensaje: limpiarTexto(detalle?.mensaje || detalle?.message || '')
    }))
    .filter((detalle) => detalle.mensaje !== '')
}

export function interpretarError(error, contexto = 'general') {
  const contextoSeguro = CONTEXTOS[contexto] || CONTEXTOS.general
  const estado = Number(error?.response?.status) || 0
  const codigo = codigoSeguro(error)
  const servidor = estado >= 500 ? '' : mensajeServidor(error)
  const detalles = obtenerDetallesCampo(error)
  const sinRespuesta = !error?.response
  const errorDeRed = sinRespuesta && (
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED' ||
    /network|timeout/i.test(error?.message || '')
  )

  let titulo = contextoSeguro.titulo
  let mensaje = contextoSeguro.mensaje
  let puedeReintentar = false

  if (errorDeRed) {
    titulo = 'Sin conexión'
    mensaje = 'No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo nuevamente.'
    puedeReintentar = true
  } else if (estado === 401) {
    if (contexto === 'login') {
      titulo = 'Credenciales incorrectas'
      mensaje = servidor || 'Correo o contraseña incorrectos. Comprueba tus datos e inténtalo nuevamente.'
    } else {
      titulo = 'Sesión expirada'
      mensaje = 'Tu sesión ha expirado. Inicia sesión nuevamente para continuar.'
    }
  } else if (estado === 403) {
    titulo = 'Sin permiso'
    mensaje = 'No tienes permiso para realizar esta acción.'
  } else if (estado === 404) {
    titulo = 'No encontramos este recurso'
    mensaje = servidor || contextoSeguro.mensaje
  } else if (estado === 409) {
    titulo = 'No se puede completar la acción'
    mensaje = servidor || 'Esta acción no está disponible para el estado actual.'
  } else if (estado === 413) {
    titulo = 'Archivo demasiado grande'
    mensaje = servidor || 'El video supera el tamaño máximo permitido de 100 MB.'
    puedeReintentar = true
  } else if (estado === 415) {
    titulo = 'Formato no admitido'
    mensaje = servidor || 'Selecciona un archivo MP4, WebM o MOV válido.'
    puedeReintentar = true
  } else if (estado === 422) {
    titulo = 'Revisa los datos'
    mensaje = servidor || 'Los datos no son válidos. Revisa los campos señalados.'
  } else if (estado === 400) {
    titulo = 'Solicitud incorrecta'
    mensaje = servidor || 'La solicitud no es válida. Revisa los datos e inténtalo nuevamente.'
    puedeReintentar = true
  } else if (estado === 429) {
    titulo = 'Demasiados intentos'
    mensaje = servidor || 'Espera un momento antes de volver a intentarlo.'
    puedeReintentar = true
  } else if (estado >= 500) {
    titulo = 'Error del servidor'
    mensaje = 'El servidor no pudo completar la operación. Inténtalo nuevamente.'
    puedeReintentar = true
  } else if (servidor) {
    mensaje = servidor
  } else if (sinRespuesta) {
    mensaje = limpiarTexto(error?.message) || contextoSeguro.mensaje
  }

  return {
    titulo,
    mensaje,
    codigo,
    detalles,
    puedeReintentar,
    sesionExpirada: estado === 401 && contexto !== 'login',
    permisoDenegado: estado === 403,
    estado
  }
}

export function obtenerMensajeError(error, fallback = 'No se pudo completar la solicitud.') {
  return interpretarError(error).mensaje || fallback
}

export function obtenerDetallesValidacion(error) {
  return obtenerDetallesCampo(error).map((detalle) => detalle.mensaje)
}

export function esSesionExpirada(error) {
  return error?.response?.status === 401
}

export function esPermisoDenegado(error) {
  return error?.response?.status === 403
}
