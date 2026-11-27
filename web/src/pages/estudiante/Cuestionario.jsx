import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ClipboardList } from 'lucide-react'

import api from '../../services/api'
import { esSesionExpirada, interpretarError } from '../../services/errores'
import {
  MAX_INTENTOS,
  CUESTIONARIO_PENDIENTE,
  adaptarCuestionario,
  adaptarResultado,
  enviarRespuestas,
  obtenerCuestionario
} from '../../services/cuestionario.service'
import ErrorMessage from '../../components/ErrorMessage'
import PreguntaCuestionario from '../../components/PreguntaCuestionario'
import ResultadoCuestionario from '../../components/ResultadoCuestionario'
import { useAuth } from '../../context/AuthContext'
import './Cuestionario.css'

function Cuestionario() {
  const { id, leccionId } = useParams()
  const { cerrarSesion } = useAuth()

  const [info, setInfo] = useState(null)
  const [cuestionario, setCuestionario] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [pendiente, setPendiente] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)
  const enviandoRef = useRef(false)

  useEffect(() => {
    let activo = true

    const prepararCuestionario = async () => {
      try {
        setCargando(true)
        setErrorInfo(null)

        const respuesta = await api.get(`/inscripciones/cursos/${id}`)
        const temario = respuesta.data.temario || []
        const leccion = temario.find(
          (item) => Number(item.id) === Number(leccionId)
        )

        if (!activo) return

        setInfo({
          curso: respuesta.data.curso,
          leccion: leccion || null
        })

        try {
          const datos = await obtenerCuestionario()

          if (activo) {
            setCuestionario(adaptarCuestionario(datos))
          }
        } catch (err) {
          if (err.code === CUESTIONARIO_PENDIENTE) {
            if (activo) setPendiente(true)
          } else if (activo) {
            setErrorInfo(interpretarError(err, 'carga'))
          }
        }
      } catch (err) {
        if (esSesionExpirada(err)) {
          cerrarSesion()
          return
        }

        if (activo) {
          setErrorInfo(interpretarError(err, 'carga'))
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    prepararCuestionario()

    return () => {
      activo = false
    }
  }, [cerrarSesion, id, leccionId])

  const enviar = async () => {
    if (!cuestionario || resultado || enviandoRef.current) return

    const sinResponder = cuestionario.preguntas.filter(
      (pregunta) => respuestas[pregunta.id] === undefined
    )

    if (sinResponder.length > 0) {
      setErrorInfo({
        titulo: 'Respuestas incompletas',
        mensaje: `Responde las ${sinResponder.length} preguntas pendientes antes de enviar.`
      })
      return
    }

    if (intentosAgotados) {
      setErrorInfo({
        titulo: 'Intentos agotados',
        mensaje: 'Ya alcanzaste el número máximo de intentos.'
      })
      return
    }

    enviandoRef.current = true

    try {
      setEnviando(true)
      setErrorInfo(null)

      const datos = await enviarRespuestas({
        cursoId: Number(id),
        leccionId: Number(leccionId),
        respuestas
      })

      if (datos) {
        setResultado(adaptarResultado(datos))
      }
    } catch (err) {
      if (err.code === CUESTIONARIO_PENDIENTE) {
        setErrorInfo({
          titulo: 'Funcionalidad pendiente',
          mensaje: err.message
        })
      } else {
        setErrorInfo(interpretarError(err, 'accion'))
      }
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  const temarioHref = `/mis-cursos/${id}`
  const maxIntentos = cuestionario?.maxIntentos ?? MAX_INTENTOS
  const intentoActual = cuestionario?.intentoActual ?? null
  const intentosRestantes = cuestionario?.intentosRestantes ?? null
  const intentosAgotados = cuestionario
    ? intentosRestantes !== null
      ? intentosRestantes <= 0
      : intentoActual !== null && intentoActual >= maxIntentos
    : false
  const preguntas = cuestionario?.preguntas || []
  const respondidas = preguntas.filter(
    (pregunta) => respuestas[pregunta.id] !== undefined
  ).length
  const siguienteHref = resultado?.siguienteLeccionId
    ? `/mis-cursos/${id}/lecciones/${resultado.siguienteLeccionId}`
    : null

  return (
    <section className="cuestionario-page">
      <Link
        to={temarioHref}
        className="cuestionario-volver"
        aria-label="Volver al temario"
      >
        <ArrowLeft size={18} />
        Volver al temario
      </Link>

      <header className="cuestionario-encabezado">
        <div className="cuestionario-encabezado-icono">
          <ClipboardList size={34} />
        </div>

        <div>
          <span>{info?.curso?.titulo || 'Curso'}</span>
          <h1>{info?.leccion?.titulo || 'Cuestionario'}</h1>
          <p>
            {resultado
              ? 'Resultado del cuestionario'
              : 'Responde todas las preguntas y envía tus respuestas.'}
          </p>
        </div>
      </header>

      <div className="cuestionario-datos">
        <div>
          <span>Intento actual</span>
          <strong>{intentoActual ?? '—'} de {maxIntentos}</strong>
        </div>

        <div>
          <span>Intentos restantes</span>
          <strong>{intentosRestantes ?? '—'}</strong>
        </div>

        <div>
          <span>Nota mínima de aprobación</span>
          <strong>
            {cuestionario?.notaMinima === null || !cuestionario
              ? 'Pendiente de configuración'
              : `${cuestionario.notaMinima} / 100`}
          </strong>
        </div>

        {cuestionario && (
          <div>
            <span>Preguntas respondidas</span>
            <strong>{respondidas} de {preguntas.length}</strong>
          </div>
        )}
      </div>

      {cargando ? (
        <div className="cuestionario-estado">
          Preparando el cuestionario...
        </div>
      ) : resultado ? (
        <ResultadoCuestionario
          resultado={resultado}
          siguienteHref={siguienteHref}
          temarioHref={temarioHref}
        />
      ) : (
        <>
          <ErrorMessage {...errorInfo} />

          {pendiente ? (
            <div className="cuestionario-pendiente">
              <AlertCircle size={24} />
              <div>
                <h2>Cuestionario pendiente de integración</h2>
                <p>
                  La pantalla y las validaciones están listas. Las preguntas,
                  intentos y calificaciones aparecerán cuando el backend
                  proporcione los endpoints definitivos.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="cuestionario-preguntas">
                {preguntas.map((pregunta, indice) => (
                  <PreguntaCuestionario
                    key={pregunta.id}
                    pregunta={pregunta}
                    numero={indice + 1}
                    respuesta={respuestas[pregunta.id]}
                    deshabilitado={enviando || intentosAgotados}
                    onSeleccionar={(preguntaId, opcionId) => {
                      setRespuestas((actuales) => ({
                        ...actuales,
                        [preguntaId]: opcionId
                      }))
                    }}
                  />
                ))}
              </div>

              <div className="cuestionario-enviar">
                <button
                  type="button"
                  className="primary-button"
                  disabled={enviando || intentosAgotados || preguntas.length === 0}
                  onClick={enviar}
                >
                  {enviando ? 'Enviando...' : 'Enviar respuestas'}
                </button>

                {intentosAgotados && (
                  <p>No tienes intentos disponibles.</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default Cuestionario
