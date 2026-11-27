import { useCallback, useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  BookOpen,
  BookOpenCheck,
  BookMarked,
  FilePenLine,
  CheckCircle,
  Archive,
  ArrowRight
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { listarTodosCursosInstructor } from '../../services/instructor.service'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import './Instructor.css'

function InstructorHome() {
  const { usuario, cerrarSesion } = useAuth()

  const [cursos, setCursos] = useState([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [errorInfo, setErrorInfo] = useState(null)

  const cargarResumen = useCallback(async () => {
    try {
      setCargando(true)
      setErrorInfo(null)

      const respuesta = await listarTodosCursosInstructor()

      setCursos(respuesta.cursos)
      setTotal(respuesta.total)
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setErrorInfo(interpretarError(err, 'carga'))
    } finally {
      setCargando(false)
    }
  }, [cerrarSesion])

  useEffect(() => {
    Promise.resolve().then(() => cargarResumen())
  }, [cargarResumen])

  const conteos = cursos.reduce(
    (acumulado, curso) => {
      if (acumulado[curso.estado] !== undefined) {
        acumulado[curso.estado] += 1
      }
      return acumulado
    },
    { borrador: 0, publicado: 0, archivado: 0 }
  )

  const cursosRecientes = cursos.slice(0, 3)

  const valor = (numero) => (
    cargando ? '...' : errorInfo ? '—' : numero
  )

  return (
    <>
      <header className="topbar">
        <div>
          <h1>¡Hola, {usuario?.nombre || 'instructor'}!</h1>
          <p>Administra tus cursos y acompaña cada aprendizaje.</p>
        </div>

        <div className="user-avatar">
          {usuario?.nombre?.charAt(0).toUpperCase() || 'I'}
        </div>
      </header>

      <section className="welcome-card">
        <div className="welcome-content">
          <span className="welcome-tag">BIENVENIDO A MINIAULA</span>

          <h2>Crea y comparte conocimiento</h2>

          <p>
            Organiza tus lecciones, publica tus cursos y construye nuevas
            oportunidades de aprendizaje desde un solo lugar.
          </p>
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
            <strong>{valor(total)}</strong>
            <span>Total de cursos</span>
          </div>
        </article>

        <article className="inicio-resumen-card">
          <div className="inicio-resumen-icono">
            <FilePenLine size={25} />
          </div>
          <div>
            <strong>{valor(conteos.borrador)}</strong>
            <span>En borrador</span>
          </div>
        </article>

        <article className="inicio-resumen-card">
          <div className="inicio-resumen-icono">
            <CheckCircle size={25} />
          </div>
          <div>
            <strong>{valor(conteos.publicado)}</strong>
            <span>Publicados</span>
          </div>
        </article>

        <article className="inicio-resumen-card">
          <div className="inicio-resumen-icono">
            <Archive size={25} />
          </div>
          <div>
            <strong>{valor(conteos.archivado)}</strong>
            <span>Archivados</span>
          </div>
        </article>
      </section>

      <section className="content-section inicio-cursos-section">
        <div className="section-heading">
          <div>
            <h2>Tus cursos recientes</h2>
            <p>Continúa administrando los cursos que has creado.</p>
          </div>

          <NavLink to="/instructor/cursos">
            Ver todos
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
              onRetry={errorInfo.puedeReintentar ? () => cargarResumen() : undefined}
            />
          </div>
        ) : cursos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <BookOpen size={35} />
            </div>

            <h3>¡Comienza a enseñar!</h3>

            <p>
              Todavía no tienes cursos. En Mis cursos puedes crear tu primer
              curso y preparar sus lecciones.
            </p>
          </div>
        ) : (
          <div className="inicio-cursos-grid">
            {cursosRecientes.map((curso) => (
              <article className="inicio-curso-card" key={curso.id}>
                <div className="inicio-curso-icono">
                  <BookMarked size={30} />
                </div>

                <div className="inicio-curso-datos">
                  <span className="curso-categoria">
                    {curso.categoria || 'General'}
                  </span>

                  <h3>{curso.titulo}</h3>

                  <p>{curso.descripcion || 'Sin descripción.'}</p>

                  <div className="instructor-curso-meta">
                    <span className={`instructor-estado ${curso.estado}`}>
                      {curso.estado}
                    </span>
                    <span>{curso.nivel || 'Nivel general'}</span>
                  </div>

                  <Link
                    to={`/instructor/cursos/${curso.id}/lecciones`}
                    className="inicio-continuar"
                  >
                    <ArrowRight size={17} />
                    Administrar lecciones
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default InstructorHome
