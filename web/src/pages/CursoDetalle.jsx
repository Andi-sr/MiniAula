
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  GraduationCap,
  ArrowLeft,
  CheckCircle,
  Lock,
  UserRound
} from 'lucide-react'

import api from '../services/api'
import './CursoDetalle.css'

function CursoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [curso, setCurso] = useState(null)
  const [temario, setTemario] = useState([])
  const [inscrito, setInscrito] = useState(false)

  const [cargando, setCargando] = useState(true)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const cargarCurso = async () => {
      try {
        setCargando(true)
        setError('')

        const [respuestaCurso, respuestaInscripcion] =
          await Promise.all([
            api.get(`/cursos/${id}`),
            api.get(`/inscripciones/cursos/${id}/estado`)
          ])

        setCurso(respuestaCurso.data.curso)
        setTemario(respuestaCurso.data.temario || [])
        setInscrito(respuestaInscripcion.data.inscrito)
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
          'No se pudo cargar la información del curso.'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarCurso()
  }, [id])

  const manejarInscripcion = async () => {
    try {
      setInscribiendo(true)
      setError('')
      setMensaje('')

      const respuesta = await api.post(`/cursos/${id}/inscripcion`)

      setInscrito(true)
      setMensaje(
        respuesta.data.mensaje ||
        'Te has inscrito correctamente en el curso.'
      )
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        'No se pudo realizar la inscripción.'
      )
    } finally {
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

  if (error && !curso) {
    return (
      <section className="detalle-estado">
        <BookOpen size={40} />
        <h2>No se pudo cargar el curso</h2>
        <p>{error}</p>

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

              <div>
                <UserRound size={20} />
                <span>Curso de MiniAula</span>
              </div>
            </div>
          </div>

          <div className="detalle-seccion">
            <h2>Contenido del curso</h2>

            <p>
              Este es el temario que estudiarás al inscribirte.
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

                  <Lock size={17} />
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
            Inscríbete en este curso para acceder a sus lecciones
            y comenzar tu aprendizaje.
          </p>

          {error && (
            <div className="detalle-mensaje error">
              {error}
            </div>
          )}

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
                to="/mis-cursos"
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
