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

import api from '../../services/api'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import './CursoInscrito.css'

const ESTADOS_PROGRESO = {
  sin_lecciones: 'Sin lecciones',
  sin_iniciar: 'Sin iniciar',
  en_progreso: 'En progreso',
  completado: 'Completado'
}

function obtenerEstadoProgreso(estado) {
  if (!estado) return ''
  return ESTADOS_PROGRESO[estado] || estado
}

function CursoInscrito() {
  const { id } = useParams()
  const { cerrarSesion } = useAuth()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorInfo, setErrorInfo] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const cargarCurso = async () => {
      try {
        setCargando(true)
        setErrorInfo(null)

        const respuesta = await api.get(`/inscripciones/cursos/${id}`)
        setDatos(respuesta.data)
      } catch (err) {
        if (esSesionExpirada(err)) {
          cerrarSesion()
          return
        }

        setErrorInfo(interpretarError(err, 'carga'))
      } finally {
        setCargando(false)
      }
    }

    cargarCurso()
  }, [cerrarSesion, id, intento])

  const reintentar = () => {
    setCargando(true)
    setErrorInfo(null)
    setIntento((valor) => valor + 1)
  }

  if (cargando) {
    return (
      <section className="curso-inscrito-page">
        <div className="curso-inscrito-estado">
          Cargando el contenido del curso...
        </div>
      </section>
    )
  }

  if (errorInfo) {
    return (
      <section className="curso-inscrito-page">
        <div className="curso-inscrito-estado curso-inscrito-error">
          <AlertCircle size={35} />
          <h2>No pudimos abrir el curso</h2>

          <ErrorMessage
            {...errorInfo}
            onRetry={errorInfo.puedeReintentar ? reintentar : undefined}
          />

          <Link to="/mis-cursos">Volver a Mis cursos</Link>
        </div>
      </section>
    )
  }

  if (!datos?.curso) {
    return (
      <section className="curso-inscrito-page">
        <div className="curso-inscrito-estado">
          No se encontró la información del curso.
          <Link to="/mis-cursos">Volver a Mis cursos</Link>
        </div>
      </section>
    )
  }

  const { curso, progreso, temario = [] } = datos

  const porcentaje = Number(progreso?.porcentaje || 0)
  const completadas = Number(progreso?.leccionesCompletadas || 0)
  const totalLecciones = Number(progreso?.totalLecciones || 0)
  const estadoProgreso = obtenerEstadoProgreso(progreso?.estado)

  const temarioOrdenado = [...temario].sort(
    (a, b) => Number(a.orden || 0) - Number(b.orden || 0)
  )

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
      <Link
        to="/mis-cursos"
        className="curso-inscrito-volver"
        aria-label="Volver a Mis cursos"
      >
        <ArrowLeft size={18} />
        Volver a Mis cursos
      </Link>

      <header className="curso-inscrito-portada">
        <div className="curso-inscrito-icono">
          <GraduationCap size={65} strokeWidth={1.4} />
        </div>

        <div>
          {curso.categoria && <span>{curso.categoria}</span>}
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

            {temarioOrdenado.length === 0 ? (
              <div className="curso-inscrito-vacio">
                Todavía no hay lecciones disponibles en este curso.
              </div>
            ) : (
              <div className="curso-inscrito-lecciones">
                {temarioOrdenado.map((leccion, index) => {
                  const estado = obtenerEstado(leccion.estado)

                  const contenidoLeccion = (
                    <>
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
                    </>
                  )

                  if (
                    leccion.estado === 'actual' ||
                    leccion.estado === 'completada'
                  ) {
                    return (
                      <Link
                        to={`/mis-cursos/${id}/lecciones/${leccion.id}`}
                        className={`curso-inscrito-leccion ${estado.clase} curso-leccion-enlace`}
                        key={leccion.id}
                      >
                        {contenidoLeccion}
                      </Link>
                    )
                  }

                  return (
                    <article
                      className={`curso-inscrito-leccion ${estado.clase}`}
                      key={leccion.id}
                    >
                      {contenidoLeccion}
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
              {completadas} de {totalLecciones} lecciones completadas
            </p>

            {estadoProgreso && <p>Estado: {estadoProgreso}</p>}

            {progreso?.leccionActual?.titulo && (
              <p>Lección actual: {progreso.leccionActual.titulo}</p>
            )}

            {curso.instructor?.nombre && (
              <div className="curso-inscrito-instructor">
                <GraduationCap size={19} />
                <span>Instructor: {curso.instructor.nombre}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}

export default CursoInscrito
