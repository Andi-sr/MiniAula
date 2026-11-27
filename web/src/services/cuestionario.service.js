export const MAX_INTENTOS = 3
export const CUESTIONARIO_PENDIENTE = 'CUESTIONARIO_PENDIENTE'

function errorPendiente(accion) {
  const error = new Error(
    `El cuestionario aún no tiene endpoints disponibles (${accion}).`
  )
  error.code = CUESTIONARIO_PENDIENTE
  error.accion = accion
  return error
}

function numeroSeguro(valor, porDefecto = null) {
  if (valor === null || valor === undefined || valor === '') return porDefecto

  const numero = Number(valor)

  return Number.isFinite(numero) ? numero : porDefecto
}

function textoSeguro(valor, porDefecto = '') {
  if (typeof valor !== 'string') return porDefecto
  return valor.slice(0, 500)
}

export function obtenerCuestionario() {
  throw errorPendiente('carga')
}

export function enviarRespuestas() {
  throw errorPendiente('envío')
}

export function adaptarCuestionario(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return null
  }

  const preguntas = Array.isArray(datos.preguntas)
    ? datos.preguntas.map((pregunta, indicePregunta) => ({
      id: pregunta.id ?? indicePregunta + 1,
      enunciado: textoSeguro(
        pregunta.enunciado ?? pregunta.pregunta,
        'Enunciado no disponible'
      ),
      opciones: (Array.isArray(pregunta.opciones)
        ? pregunta.opciones
        : []
      ).map((opcion, indiceOpcion) => ({
        id: opcion.id ?? indiceOpcion + 1,
        texto: textoSeguro(
          typeof opcion === 'string'
            ? opcion
            : opcion.texto ?? opcion.text,
          `Opción ${indiceOpcion + 1}`
        )
      }))
    }))
    : []

  return {
    id: datos.id ?? null,
    titulo: textoSeguro(datos.titulo, 'Cuestionario'),
    cursoTitulo: textoSeguro(datos.cursoTitulo),
    intentoActual: numeroSeguro(datos.intentoActual),
    maxIntentos: numeroSeguro(datos.maxIntentos, MAX_INTENTOS),
    notaMinima: numeroSeguro(datos.notaMinima),
    intentosRestantes: numeroSeguro(datos.intentosRestantes),
    preguntas
  }
}

export function adaptarResultado(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return null
  }

  return {
    nota: numeroSeguro(datos.nota),
    aprobado: typeof datos.aprobado === 'boolean' ? datos.aprobado : null,
    mejorNota: numeroSeguro(datos.mejorNota),
    intentosUtilizados: numeroSeguro(datos.intentosUtilizados),
    intentosRestantes: numeroSeguro(datos.intentosRestantes),
    mensaje: textoSeguro(datos.mensaje, 'Resultado recibido del servidor.'),
    puedeSiguiente: datos.puedeSiguiente === true,
    siguienteLeccionId: datos.siguienteLeccionId ?? null
  }
}
