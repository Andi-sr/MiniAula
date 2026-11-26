
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  GraduationCap,
  AlertCircle,
  PlayCircle
} from 'lucide-react'

import api from '../services/api'
import './LeccionAprendizaje.css'

function LeccionAprendizaje() {
  const { id, leccionId } = useParams()
  const navigate = useNavigate()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [completando, setCompletando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const cargarLeccion = async () => {
      try {
        setCargando(true)
        setError('')

        const respuesta = await api.get(
          `/cursos/${id}/lecciones/${leccionId}`
        )

        setDatos(respuesta.data)
      } catch (err) {
        setError(
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No se pudo cargar la lección.'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarLeccion()
  }, [id, leccionId])

  const marcarCompletada = async () => {
    try {
      setCompletando(true)
      setError('')
      setMensaje('')

      const respuesta = await api.post(
        `/cursos/${id}/lecciones/${leccionId}/completar`
      )

      setMensaje(
        respuesta.data.mensaje ||
        '¡Lección completada correctamente!'
      )
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'No se pudo completar la lección.'
      )
    } finally {
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

  if (error && !datos) {
    return (
      <section className="leccion-page">
        <div className="leccion-estado leccion-error">
          <AlertCircle size={35} />
          <h2>No se pudo abrir la lección</h2>
          <p>{error}</p>
          <Link to={`/mis-cursos/${id}`}>
            Volver al curso
          </Link>
        </div>
      </section>
    )
  }

  const { curso, leccion, progreso } = datos

  const yaCompletada = progreso?.completadas?.some(
    item => Number(item.id) === Number(leccion.id)
  )

  return (
    <section className="leccion-page">
      <Link
        to={`/mis-cursos/${id}`}
        className="leccion-volver"
      >
        <ArrowLeft size={18} />
        Volver al curso
      </Link>

      <header className="leccion-encabezado">
        <div className="leccion-icono">
          <BookOpen size={38} />
        </div>

        <div>
          <span>{curso?.titulo || 'Mi curso'}</span>
          <h1>{leccion.titulo}</h1>
          <p>
            Lección {leccion.orden} de {progreso?.totalLecciones || 0}
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

        {leccion.tipo === 'cuestionario' ? (
          <div className="leccion-aviso">
            <AlertCircle size={22} />
            <div>
              <strong>Esta lección es un cuestionario.</strong>
              <p>
                La actividad de evaluación se conectará en el siguiente paso.
              </p>
            </div>
          </div>
        ) : (
          <div className="leccion-texto">
            {leccion.contenido ? (
              leccion.contenido
            ) : (
              <p>
                El instructor todavía no ha agregado contenido a esta lección.
              </p>
            )}
          </div>
        )}

        {leccion.videoPath && (
          <div className="leccion-video-pendiente">
            <PlayCircle size={22} />
            <span>
              Esta lección también tiene un video. Conectaremos su reproducción
              autorizada en el siguiente paso.
            </span>
          </div>
        )}

        {error && (
          <div className="leccion-mensaje-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {mensaje && (
          <div className="leccion-mensaje-exito">
            <CheckCircle size={19} />
            {mensaje}
          </div>
        )}

        {yaCompletada || mensaje ? (
          <div className="leccion-finalizada">
            <CheckCircle size={22} />
            <span>Esta lección está completada.</span>

            <button
              type="button"
              onClick={() => navigate(`/mis-cursos/${id}`)}
            >
              Volver al temario
            </button>
          </div>
        ) : leccion.tipo === 'contenido' ? (
          <button
            type="button"
            className="leccion-completar"
            onClick={marcarCompletada}
            disabled={completando || !leccion.contenido}
          >
            <CheckCircle size={19} />
            {completando
              ? 'Guardando progreso...'
              : 'Marcar como completada'}
          </button>
        ) : null}
      </article>

      <div className="leccion-nota">
        <GraduationCap size={19} />
        <p>
          Completa las lecciones en orden para desbloquear el siguiente
          contenido del curso.
        </p>
      </div>
    </section>
  )
}

export default LeccionAprendizaje
