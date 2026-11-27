import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  GraduationCap,
  AlertCircle,
  Lock,
  PlayCircle
} from 'lucide-react'

import api from '../../services/api'
import {
  esSesionExpirada,
  interpretarError
} from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import VideoPlayer from '../../components/VideoPlayer'
import { useAuth } from '../../context/AuthContext'
import './LeccionAprendizaje.css'

const ESTADOS_LECCION = {
  completada: { texto: 'Completada', clase: 'completada' },
  actual: { texto: 'Disponible', clase: 'actual' },
  bloqueada: { texto: 'Bloqueada', clase: 'bloqueada' }
}

function obtenerEstado(estado) {
  return ESTADOS_LECCION[estado] || ESTADOS_LECCION.bloqueada
}

function esPermitida(leccion) {
  return leccion?.estado === 'actual' || leccion?.estado === 'completada'
}

function construirTemario(progreso) {
  if (!progreso) return []

  const actual = progreso.leccionActual?.id
  const lecciones = [
    ...(progreso.completadas || []).map((leccion) => ({
      ...leccion,
      estado: 'completada'
    })),
    ...(progreso.pendientes || []).map((leccion) => ({
      ...leccion,
      estado: Number(leccion.id) === Number(actual) ? 'actual' : 'bloqueada'
    })),
    ...(progreso.bloqueadas || []).map((leccion) => ({
      ...leccion,
      estado: 'bloqueada'
    }))
  ]

  const vistas = new Set()

  return lecciones
    .filter((leccion) => {
      if (vistas.has(leccion.id)) return false
      vistas.add(leccion.id)
      return true
    })
    .sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
}

function LeccionAprendizaje() {
  const { id, leccionId } = useParams()
  const { cerrarSesion } = useAuth()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [completando, setCompletando] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [intento, setIntento] = useState(0)
  const [temarioAbierto, setTemarioAbierto] = useState(false)

  const completandoRef = useRef(false)

  useEffect(() => {
    let activo = true

    const cargarLeccion = async () => {
      try {
        setCargando(true)
        setErrorInfo(null)
        setMensaje('')

        const respuestaLeccion = await api.get(
          `/cursos/${id}/lecciones/${leccionId}`
        )

        let temario = []
        let cursoInscrito = null

        try {
          const respuestaTemario = await api.get(`/inscripciones/cursos/${id}`)
          temario = respuestaTemario.data.temario || []
          cursoInscrito = respuestaTemario.data.curso || null
        } catch (err) {
          if (esSesionExpirada(err)) throw err
        }

        if (activo) {
          setDatos({
            ...respuestaLeccion.data,
            temario,
            cursoInscrito
          })
        }
      } catch (err) {
        if (esSesionExpirada(err)) {
          cerrarSesion()
          return
        }

        if (activo) {
          setErrorInfo({
            ...interpretarError(err, 'carga'),
            origen: 'carga'
          })
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarLeccion()

    return () => {
      activo = false
    }
  }, [cerrarSesion, id, intento, leccionId])

  const marcarCompletada = async () => {
    const completada = datos?.progreso?.completadas?.some(
      (item) => Number(item.id) === Number(datos?.leccion?.id)
    )

    if (completandoRef.current || completada) return

    completandoRef.current = true

    try {
      setCompletando(true)
      setErrorInfo(null)
      setMensaje('')

      const respuesta = await api.post(
        `/cursos/${id}/lecciones/${leccionId}/completar`
      )

      let actualizacion = null

      try {
        actualizacion = await api.get(`/inscripciones/cursos/${id}`)
      } catch (err) {
        if (esSesionExpirada(err)) {
          cerrarSesion()
        }
      }

      setDatos((actual) => (
        actual
          ? {
            ...actual,
            progreso: respuesta.data.progreso || actual.progreso,
            temario: actualizacion?.data?.temario || actual.temario,
            cursoInscrito: actualizacion?.data?.curso || actual.cursoInscrito
          }
          : actual
      ))
      setMensaje(
        respuesta.data.mensaje || '¡Lección completada correctamente!'
      )
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setErrorInfo({
        ...interpretarError(err, 'accion'),
        origen: 'accion'
      })
    } finally {
      completandoRef.current = false
      setCompletando(false)
    }
  }

  if (cargando) {
    return (
      <section className="leccion-page">
        <div className="leccion-estado">
          Cargando lección...
        </div>
      </section>
    )
  }

  if (errorInfo && !datos) {
    return (
      <section className="leccion-page">
        <div className="leccion-estado leccion-error">
          <AlertCircle size={35} />
          <h2>No se pudo abrir la lección</h2>

          <ErrorMessage
            {...errorInfo}
            onRetry={errorInfo.puedeReintentar
              ? () => setIntento((valor) => valor + 1)
              : undefined}
          />

          <Link to={`/mis-cursos/${id}`}>
            Volver al temario
          </Link>
        </div>
      </section>
    )
  }

  const { curso, leccion, progreso } = datos
  const temarioBackend = datos.temario || []
  const temarioOrdenado = (temarioBackend.length
    ? temarioBackend
    : construirTemario(progreso)
  ).slice().sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
  const indiceActual = temarioOrdenado.findIndex(
    (item) => Number(item.id) === Number(leccion.id)
  )
  const anterior = indiceActual > 0
    ? temarioOrdenado[indiceActual - 1]
    : null
  const siguiente = indiceActual >= 0
    ? temarioOrdenado[indiceActual + 1]
    : null
  const puedeAnterior = Boolean(anterior && esPermitida(anterior))
  const puedeSiguiente = Boolean(siguiente && esPermitida(siguiente))
  const porcentaje = Number(progreso?.porcentaje || 0)
  const completadas = Number(progreso?.leccionesCompletadas || 0)
  const totalLecciones = Number(progreso?.totalLecciones || 0)
  const tituloCurso = datos.cursoInscrito?.titulo || curso?.titulo || ''
  const yaCompletada = progreso?.completadas?.some(
    (item) => Number(item.id) === Number(leccion.id)
  )
  const tieneContenido = Boolean(leccion.contenido || leccion.videoPath)

  const reintentarError = () => {
    if (errorInfo?.origen === 'accion') {
      marcarCompletada()
      return
    }

    setIntento((valor) => valor + 1)
  }

  return (
    <section className="leccion-page">
      <Link
        to={`/mis-cursos/${id}`}
        className="leccion-volver"
        aria-label="Volver al temario"
      >
        <ArrowLeft size={18} />
        Volver al temario
      </Link>

      <div className="leccion-layout">
        <aside className={`leccion-temario-lateral${temarioAbierto ? ' abierto' : ''}`}>
          <button
            type="button"
            className="leccion-temario-toggle"
            aria-expanded={temarioAbierto}
            onClick={() => setTemarioAbierto((abierto) => !abierto)}
          >
            <BookOpen size={19} />
            <span>Temario del curso</span>
            <ChevronDown size={18} />
          </button>

          <div className="leccion-temario-contenido">
            <div className="leccion-temario-cabecera">
              <span className="leccion-temario-etiqueta">Curso</span>
              <h2>{tituloCurso}</h2>

              <div className="leccion-temario-progreso">
                <span>Progreso total</span>
                <strong>{porcentaje}%</strong>
              </div>

              <div className="leccion-temario-barra">
                <span
                  style={{
                    width: `${Math.min(100, Math.max(0, porcentaje))}%`
                  }}
                />
              </div>

              <small>
                {completadas} de {totalLecciones} lecciones completadas
              </small>
            </div>

            <nav
              className="leccion-temario-lista"
              aria-label="Lecciones del curso"
            >
              {temarioOrdenado.length === 0 ? (
                <p className="leccion-temario-vacio">
                  Este curso todavía no tiene lecciones.
                </p>
              ) : temarioOrdenado.map((item, indice) => {
                const estado = obtenerEstado(item.estado)
                const permitida = esPermitida(item)
                const contenidoItem = (
                  <>
                    <span className="leccion-temario-numero">
                      {item.orden || indice + 1}
                    </span>

                    <span className="leccion-temario-item-info">
                      <strong>{item.titulo}</strong>
                      <small>{estado.texto}</small>
                    </span>

                    {item.estado === 'completada' ? (
                      <CheckCircle size={17} />
                    ) : item.estado === 'actual' ? (
                      <PlayCircle size={17} />
                    ) : (
                      <Lock size={17} />
                    )}
                  </>
                )

                return permitida ? (
                  <Link
                    key={item.id}
                    to={`/mis-cursos/${id}/lecciones/${item.id}`}
                    className={`leccion-temario-item ${estado.clase}`}
                    aria-current={
                      Number(item.id) === Number(leccion.id) ? 'step' : undefined
                    }
                  >
                    {contenidoItem}
                  </Link>
                ) : (
                  <div
                    key={item.id}
                    className={`leccion-temario-item ${estado.clase}`}
                    aria-disabled="true"
                  >
                    {contenidoItem}
                  </div>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="leccion-contenido-principal">
          <header className="leccion-encabezado">
            <div className="leccion-icono">
              <BookOpen size={38} />
            </div>

            <div>
              {tituloCurso && <span>{tituloCurso}</span>}
              <h1>{leccion.titulo}</h1>
              <p>
                Lección {leccion.orden} de {totalLecciones}
              </p>
            </div>
          </header>

          <article className="leccion-contenido-card">
            <div className="leccion-contenido-titulo">
              <h2>
                <BookOpen size={22} />
                Contenido de la lección
              </h2>
            </div>

            {leccion.videoPath && (
              <VideoPlayer
                videoPath={leccion.videoPath}
                titulo="Video de la lección"
              />
            )}

            {leccion.tipo === 'cuestionario' ? (
              <div className="leccion-aviso">
                <AlertCircle size={22} />
                <div>
                  <strong>Evaluación pendiente de integración.</strong>
                  <p>
                    La pantalla de cuestionario está preparada, pero el backend
                    todavía no expone preguntas ni calificaciones.
                  </p>
                </div>
              </div>
            ) : (
              <div className="leccion-texto">
                {leccion.contenido || (
                  <p>
                    El instructor todavía no ha agregado contenido a esta
                    lección.
                  </p>
                )}
              </div>
            )}

            <ErrorMessage
              {...errorInfo}
              onRetry={errorInfo?.puedeReintentar ? reintentarError : undefined}
            />

            {mensaje && (
              <div className="leccion-mensaje-exito">
                <CheckCircle size={19} />
                {mensaje}
              </div>
            )}

            <div className="leccion-acciones">
              {puedeAnterior && (
                <Link
                  className="leccion-nav"
                  to={`/mis-cursos/${id}/lecciones/${anterior.id}`}
                >
                  <ArrowLeft size={17} />
                  Anterior
                </Link>
              )}

              {yaCompletada ? (
                <div className="leccion-finalizada">
                  <CheckCircle size={20} />
                  <span>Lección completada</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="leccion-completar"
                  onClick={marcarCompletada}
                  disabled={completando || !tieneContenido}
                >
                  <CheckCircle size={19} />
                  {completando
                    ? 'Guardando progreso...'
                    : 'Marcar como completada'}
                </button>
              )}

              {puedeSiguiente && (
                <Link
                  className="leccion-completar"
                  to={`/mis-cursos/${id}/lecciones/${siguiente.id}`}
                >
                  Siguiente lección
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>

            {yaCompletada && (
              <Link
                className="leccion-temario"
                to={`/mis-cursos/${id}`}
              >
                Volver al temario
              </Link>
            )}
          </article>

          <div className="leccion-nota">
            <GraduationCap size={19} />
            <p>
              Completa las lecciones en orden para desbloquear el siguiente
              contenido del curso.
            </p>
          </div>
        </main>
      </div>
    </section>
  )
}

export default LeccionAprendizaje
