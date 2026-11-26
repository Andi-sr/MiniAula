
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Lock,
  PlayCircle,
  AlertCircle
} from 'lucide-react'

import api from '../services/api'
import './CursoInscrito.css'

function CursoInscrito() {
  const { id } = useParams()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarCurso = async () => {
      try {
        setCargando(true)
        setError('')

        const respuesta = await api.get(`/inscripciones/cursos/${id}`)
        setDatos(respuesta.data)
      } catch (err) {
        setError(
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No se pudo cargar el contenido del curso.'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarCurso()
  }, [id])

  if (cargando) {
    return (
      <section className="curso-inscrito-page">
        <div className="curso-inscrito-estado">
          Cargando el contenido del curso...
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="curso-inscrito-page">
        <div className="curso-inscrito-estado curso-inscrito-error">
          <AlertCircle size={35} />
          <h2>No pudimos abrir el curso</h2>
          <p>{error}</p>
          <Link to="/mis-cursos">Volver a mis clases</Link>
        </div>
      </section>
    )
  }

  if (!datos?.curso) {
    return (
      <section className="curso-inscrito-page">
        <div className="curso-inscrito-estado">
          No se encontró la información del curso.
          <Link to="/mis-cursos">Volver a mis clases</Link>
        </div>
      </section>
    )
  }

  const { curso, progreso, temario = [] } = datos

  const porcentaje = Number(progreso?.porcentaje || 0)
  const completadas = temario.filter(
    (leccion) => leccion.estado === 'completada'
  ).length

  const obtenerEstado = (estado) => {
    if (estado === 'completada') {
      return {
        texto: 'Completada',
        clase: 'completada'
      }
    }

    if (estado === 'actual') {
      return {
        texto: 'Disponible',
        clase: 'actual'
      }
    }

    return {
      texto: 'Bloqueada',
      clase: 'bloqueada'
    }
  }

  return (
    <section className="curso-inscrito-page">
      <Link to="/mis-cursos" className="curso-inscrito-volver">
        <ArrowLeft size={18} />
        Volver a mis clases
      </Link>

      <header className="curso-inscrito-portada">
        <div className="curso-inscrito-icono">
          <GraduationCap size={65} strokeWidth={1.4} />
        </div>

        <div>
          <span>{curso.categoria || 'Curso de MiniAula'}</span>
          <h1>{curso.titulo}</h1>
          <p>{curso.descripcion}</p>
        </div>
      </header>

      <div className="curso-inscrito-contenido">
        <main className="curso-inscrito-principal">
          <section className="curso-inscrito-panel">
            <h2>
              <BookOpen size={22} />
              Contenido del curso
            </h2>

            <p className="curso-inscrito-intro">
              Aquí puedes consultar las lecciones y continuar tu aprendizaje.
              Completa cada lección para avanzar a la siguiente.
            </p>

            {temario.length === 0 ? (
              <div className="curso-inscrito-vacio">
                Todavía no hay lecciones disponibles en este curso.
              </div>
            ) : (
              <div className="curso-inscrito-lecciones">
                {temario.map((leccion, index) => {
                  const estado = obtenerEstado(leccion.estado)

                  return (
                    <article
                      className={`curso-inscrito-leccion ${estado.clase}`}
                      key={leccion.id}
                    >
                      <div className="curso-inscrito-numero">
                        {leccion.orden || index + 1}
                      </div>

                      <div className="curso-inscrito-leccion-info">
                        <h3>{leccion.titulo}</h3>
                        <span>
                          {leccion.tipo === 'cuestionario'
                            ? 'Cuestionario'
                            : 'Lección de contenido'}
                        </span>
                      </div>

                      <div className={`curso-inscrito-estado-leccion ${estado.clase}`}>
                        {leccion.estado === 'completada' ? (
                          <CheckCircle size={19} />
                        ) : leccion.estado === 'actual' ? (
                          <PlayCircle size={19} />
                        ) : (
                          <Lock size={19} />
                        )}

                        <span>{estado.texto}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="curso-inscrito-lateral">
          <div className="curso-inscrito-panel">
            <div className="curso-inscrito-progreso-icono">
              <BookOpen size={35} />
            </div>

            <h2>Tu progreso</h2>

            <strong className="curso-inscrito-porcentaje">
              {porcentaje}%
            </strong>

            <div className="curso-inscrito-barra">
              <div
                className="curso-inscrito-barra-valor"
                style={{
                  width: `${Math.min(100, Math.max(0, porcentaje))}%`
                }}
              />
            </div>

            <p>
              {completadas} de {temario.length} lecciones completadas
            </p>

            <div className="curso-inscrito-instructor">
              <GraduationCap size={19} />
              <span>
                {curso.instructor?.nombre || 'Instructor de MiniAula'}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default CursoInscrito
