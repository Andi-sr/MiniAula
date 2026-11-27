import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BookOpen,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  Lock,
  UserRound
} from 'lucide-react'

import api from '../../services/api'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import './CursoDetalle.css'

function CursoDetalle() {
  const { id } = useParams()
  const { cerrarSesion } = useAuth()

  const [curso, setCurso] = useState(null)
  const [temario, setTemario] = useState([])
  const [inscrito, setInscrito] = useState(false)

  const [cargando, setCargando] = useState(true)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)
  const [errorEstado, setErrorEstado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [intento, setIntento] = useState(0)
  const inscribiendoRef = useRef(false)

  const cargarCurso = useCallback(async () => {
    try {
      setCargando(true)
      setErrorInfo(null)
      setErrorEstado(null)
      setCurso(null)
      setTemario([])
      setInscrito(false)

      const respuestaCurso = await api.get(`/cursos/${id}`)

      setCurso(respuestaCurso.data.curso)
      setTemario(respuestaCurso.data.temario || [])

      try {
        const respuestaInscripcion =
          await api.get(`/inscripciones/cursos/${id}/estado`)

        setInscrito(Boolean(respuestaInscripcion.data.inscrito))
      } catch (errEstado) {
        if (esSesionExpirada(errEstado)) {
          cerrarSesion()
          return
        }

        setInscrito(false)
        setErrorEstado(interpretarError(errEstado, 'carga'))
      }
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setErrorInfo(interpretarError(err, 'carga'))
    } finally {
      setCargando(false)
    }
  }, [cerrarSesion, id])

  useEffect(() => {
    Promise.resolve().then(() => cargarCurso())
  }, [cargarCurso, intento])

  const reintentarCarga = () => {
    setCargando(true)
    setErrorInfo(null)
    setErrorEstado(null)
    setIntento((valor) => valor + 1)
  }

  const manejarInscripcion = async () => {
    if (inscribiendoRef.current || inscrito) return

    try {
      inscribiendoRef.current = true
      setInscribiendo(true)
      setErrorInfo(null)
      setErrorEstado(null)
      setMensaje('')

      const respuesta = await api.post(`/cursos/${id}/inscripcion`)

      setInscrito(true)
      setMensaje(
        respuesta.data.mensaje ||
        'Te has inscrito correctamente en el curso.'
      )
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      if (err?.response?.data?.error?.code === 'ALREADY_ENROLLED') {
        setInscrito(true)
        setMensaje(interpretarError(err, 'accion').mensaje)
        return
      }

      setErrorInfo(interpretarError(err, 'accion'))
    } finally {
      inscribiendoRef.current = false
      setInscribiendo(false)
    }
  }

  if (cargando) {
    return (
      <div className="detalle-estado">
        <div className="catalogo-cargando"></div>
        <p>Cargando información del curso...</p>
      </div>
    )
  }

  if (errorInfo && !curso) {
    return (
      <section className="detalle-estado">
        <BookOpen size={40} />
        <h2>No se pudo cargar el curso</h2>

        <ErrorMessage
          {...errorInfo}
          onRetry={errorInfo.puedeReintentar ? reintentarCarga : undefined}
        />

        <Link to="/catalogo" className="detalle-volver">
          Volver al catálogo
        </Link>
      </section>
    )
  }

  if (!curso) return null

  return (
    <section className="detalle-page">

      <Link to="/catalogo" className="detalle-regresar">
        <ArrowLeft size={17} />
        Volver al catálogo
      </Link>

      <div className="detalle-portada">
        <div className="detalle-portada-icono">
          <GraduationCap size={75} strokeWidth={1.3} />
        </div>

        <div className="detalle-portada-texto">
          <span className="detalle-etiqueta">
            {curso.categoria}
          </span>

          <h1>{curso.titulo}</h1>

          <p>{curso.descripcion}</p>
        </div>
      </div>

      <div className="detalle-contenido">

        <div className="detalle-informacion">
          <div className="detalle-seccion">
            <h2>Sobre este curso</h2>

            <p>{curso.descripcion}</p>

            <div className="detalle-datos">
              <div>
                <GraduationCap size={20} />
                <span>Nivel: {curso.nivel}</span>
              </div>

              <div>
                <BookOpen size={20} />
                <span>{temario.length} lecciones</span>
              </div>

              {curso.instructor?.nombre && (
                <div>
                  <UserRound size={20} />
                  <span>Instructor: {curso.instructor.nombre}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detalle-seccion">
            <h2>Contenido del curso</h2>

            <p>
              {inscrito
                ? 'Este es el temario de tu curso.'
                : 'Este es el temario que estudiarás al inscribirte.'}
            </p>

            <div className="detalle-temario">
              {temario.map((leccion, index) => (
                <div
                  className="detalle-leccion"
                  key={leccion.id}
                >
                  <div className="detalle-leccion-numero">
                    {index + 1}
                  </div>

                  <div className="detalle-leccion-info">
                    <h3>{leccion.titulo}</h3>

                    <span>
                      {leccion.tipo === 'cuestionario'
                        ? 'Cuestionario'
                        : 'Lección de contenido'}
                    </span>
                  </div>

                  {inscrito ? (
                    <CheckCircle size={17} />
                  ) : (
                    <Lock size={17} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="detalle-panel">
          <div className="detalle-panel-icono">
            <BookOpen size={40} />
          </div>

          <h2>¡Comienza a aprender!</h2>

          <p>
            {inscrito
              ? 'Continúa con tus lecciones desde tus clases.'
              : 'Inscríbete en este curso para acceder a sus lecciones y comenzar tu aprendizaje.'}
          </p>

          <ErrorMessage {...errorInfo} variante="detalle" />
          <ErrorMessage {...errorEstado} variante="detalle" />

          {mensaje && (
            <div className="detalle-mensaje exito">
              <CheckCircle size={17} />
              {mensaje}
            </div>
          )}

          {inscrito ? (
            <>
              <div className="detalle-inscrito">
                <CheckCircle size={19} />
                Ya estás inscrito
              </div>

              <Link
                to={`/mis-cursos/${curso.id}`}
                className="detalle-boton"
              >
                Ir a mis clases
              </Link>
            </>
          ) : (
            <button
              className="detalle-boton"
              onClick={manejarInscripcion}
              disabled={inscribiendo}
            >
              {inscribiendo
                ? 'Inscribiendo...'
                : 'Inscribirme al curso'}
            </button>
          )}

          <span className="detalle-nota">
            Acceso disponible para estudiantes inscritos.
          </span>
        </aside>

      </div>
    </section>
  )
}

export default CursoDetalle
