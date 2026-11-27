import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  BookOpen,
  BookOpenCheck,
  ArrowRight,
  Search,
  CheckCircle,
  PlayCircle,
  BookMarked
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'

function Inicio() {
  const { usuario, cerrarSesion } = useAuth()

  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorInfo, setErrorInfo] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        setCargando(true)
        setErrorInfo(null)

        const respuesta = await api.get('/inscripciones/mis-cursos')

        setCursos(respuesta.data.cursos || [])
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

    cargarResumen()
  }, [cerrarSesion, intento])

  const reintentar = () => {
    setCargando(true)
    setErrorInfo(null)
    setIntento((valor) => valor + 1)
  }

  const totalCursos = cursos.length

  const totalCompletadas = cursos.reduce(
    (total, inscripcion) =>
      total + Number(inscripcion.progreso?.leccionesCompletadas || 0),
    0
  )

  const cursosRecientes = cursos.slice(0, 2)

  return (
    <>
      <header className="topbar">
        <div>
          <h1>¡Hola, {usuario?.nombre || 'bienvenido'}!</h1>
          <p>¿Qué aprenderemos hoy?</p>
        </div>

        <div className="topbar-actions">
          <NavLink to="/catalogo" className="icon-button" aria-label="Buscar">
            <Search size={20} />
          </NavLink>

          <div className="user-avatar">
            {usuario?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </header>

      <section className="welcome-card">
        <div className="welcome-content">
          <span className="welcome-tag">BIENVENIDO A MINIAULA</span>

          <h2>Aprender es una aventura</h2>

          <p>
            Explora tus clases, desarrolla nuevas habilidades y continúa
            avanzando en tu aprendizaje.
          </p>

          <NavLink to="/catalogo" className="primary-button">
            Explorar cursos
            <ArrowRight size={17} />
          </NavLink>
        </div>

        <div className="welcome-illustration">
          <BookOpenCheck size={105} strokeWidth={1.2} />
        </div>
      </section>

      <section className="inicio-resumen">
        <article className="inicio-resumen-card">
          <div className="inicio-resumen-icono">
            <BookOpen size={25} />
          </div>
          <div>
            <strong>{cargando ? '...' : totalCursos}</strong>
            <span>Cursos inscritos</span>
          </div>
        </article>

        <article className="inicio-resumen-card">
          <div className="inicio-resumen-icono">
            <CheckCircle size={25} />
          </div>
          <div>
            <strong>{cargando ? '...' : totalCompletadas}</strong>
            <span>Lecciones completadas</span>
          </div>
        </article>
      </section>

      <section className="content-section inicio-cursos-section">
        <div className="section-heading">
          <div>
            <h2>Continúa aprendiendo</h2>
            <p>Retoma tus cursos y sigue avanzando.</p>
          </div>

          <NavLink to="/mis-cursos">
            Ver todas
            <ArrowRight size={15} />
          </NavLink>
        </div>

        {cargando ? (
          <div className="empty-state">
            <p>Cargando tus cursos...</p>
          </div>
        ) : errorInfo ? (
          <div className="empty-state">
            <BookOpen size={35} />
            <h3>No pudimos cargar tus cursos</h3>

            <ErrorMessage
              {...errorInfo}
              onRetry={errorInfo.puedeReintentar ? reintentar : undefined}
            />
          </div>
        ) : cursos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BookOpen size={35} />
            </div>

            <h3>¡Comienza tu aprendizaje!</h3>

            <p>
              Todavía no estás inscrito en ningún curso.
              Explora nuestro catálogo y encuentra uno que te guste.
            </p>

            <NavLink to="/catalogo" className="secondary-button">
              Explorar catálogo
            </NavLink>
          </div>
        ) : (
          <div className="inicio-cursos-grid">
            {cursosRecientes.map((inscripcion) => {
              const curso = inscripcion.curso
              const progreso = inscripcion.progreso
              const porcentaje = Number(progreso?.porcentaje || 0)

              return (
                <article
                  className="inicio-curso-card"
                  key={inscripcion.inscripcionId}
                >
                  <div className="inicio-curso-icono">
                    <BookMarked size={30} />
                  </div>

                  <div className="inicio-curso-datos">
                    {curso.categoria && (
                      <span className="curso-categoria">
                        {curso.categoria}
                      </span>
                    )}

                    <h3>{curso.titulo}</h3>

                    {curso.descripcion && <p>{curso.descripcion}</p>}

                    <div className="inicio-curso-progreso">
                      <div className="progreso-info">
                        <span>Mi progreso</span>
                        <strong>{porcentaje}%</strong>
                      </div>

                      <div className="progreso-barra">
                        <div
                          className="progreso-barra-valor"
                          style={{
                            width: `${Math.min(100, Math.max(0, porcentaje))}%`
                          }}
                        />
                      </div>

                      <span className="inicio-curso-lecciones">
                        {progreso?.leccionesCompletadas || 0} de{' '}
                        {progreso?.totalLecciones || 0} lecciones completadas
                      </span>
                    </div>

                    <Link
                      to={`/mis-cursos/${curso.id}`}
                      className="inicio-continuar"
                    >
                      <PlayCircle size={17} />
                      Continuar aprendiendo
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="inicio-catalogo-banner">
        <div>
          <h2>¿Quieres aprender algo nuevo?</h2>
          <p>
            Explora los cursos disponibles y continúa aprendiendo.
          </p>
        </div>

        <NavLink to="/catalogo" className="secondary-button">
          Ver catálogo
          <ArrowRight size={16} />
        </NavLink>
      </section>
    </>
  )
}

export default Inicio
