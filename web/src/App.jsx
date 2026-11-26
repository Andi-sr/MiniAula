
import { useEffect, useState } from 'react'
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link
} from 'react-router-dom'

import {
  GraduationCap,
  House,
  BookOpen,
  Users,
  UserRound,
  BookOpenCheck,
  ArrowRight,
  Bell,
  Search,
  LogOut,
  CheckCircle,
  PlayCircle,
  BookMarked
} from 'lucide-react'

import { useAuth } from './context/AuthContext'
import api from './services/api'
import Login from './pages/login'
import Register from './pages/Register'
import Catalogo from './pages/Catalogo'
import CursoDetalle from './pages/CursoDetalle'
import CursoInscrito from './pages/CursoInscrito'
import './App.css'

function Sidebar() {
  const { usuario, cerrarSesion } = useAuth()

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <GraduationCap size={28} />
        </div>
        <h2>MiniAula</h2>
      </div>

      <p className="menu-label">MENÚ PRINCIPAL</p>

      <nav className="menu">
        <NavLink to="/" end>
          <House size={20} />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/catalogo">
          <Search size={20} />
          <span>Catálogo</span>
        </NavLink>

        <NavLink to="/mis-cursos">
          <BookOpen size={20} />
          <span>Mis clases</span>
        </NavLink>

        <NavLink to="/profesores">
          <Users size={20} />
          <span>Profesores</span>
        </NavLink>

        <NavLink to="/perfil">
          <UserRound size={20} />
          <span>Mi perfil</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <GraduationCap size={25} />
        <p>{usuario?.nombre || 'Usuario de MiniAula'}</p>

        <button className="logout-button" onClick={cerrarSesion}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

function Inicio() {
  const { usuario } = useAuth()

  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        setCargando(true)
        setError('')

        const respuesta = await api.get('/inscripciones/mis-cursos')

        setCursos(respuesta.data.cursos || [])
      } catch (err) {
        setError(
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'No se pudo cargar tu resumen de aprendizaje.'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarResumen()
  }, [])

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
          <button className="icon-button" aria-label="Buscar">
            <Search size={20} />
          </button>

          <button className="icon-button" aria-label="Notificaciones">
            <Bell size={20} />
          </button>

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
        ) : error ? (
          <div className="empty-state">
            <BookOpen size={35} />
            <h3>No pudimos cargar tus cursos</h3>
            <p>{error}</p>
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
                    <span className="curso-categoria">
                      {curso.categoria || 'General'}
                    </span>

                    <h3>{curso.titulo}</h3>

                    <p>
                      {curso.descripcion ||
                        'Continúa avanzando en este curso.'}
                    </p>

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
            Descubre cursos de Matemáticas, Lenguaje y Ciencias Naturales.
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

function MisCursos() {
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const cargarCursos = async () => {
    try {
      setCargando(true)
      setError('')

      const respuesta = await api.get('/inscripciones/mis-cursos')

      setCursos(respuesta.data.cursos || [])
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'No se pudieron cargar tus cursos.'
      )
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarCursos()
  }, [])

  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Mis clases</h1>
        <p>Consulta tus cursos inscritos y continúa aprendiendo.</p>
      </div>

      {cargando ? (
        <div className="empty-state">
          <p>Cargando tus cursos...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <BookOpen size={35} />
          <h3>No pudimos cargar tus clases</h3>
          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={cargarCursos}
          >
            Intentar nuevamente
          </button>
        </div>
      ) : cursos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <BookOpen size={35} />
          </div>

          <h3>Aún no tienes clases</h3>
          <p>Cuando te inscribas en un curso, aparecerá aquí.</p>

          <Link to="/catalogo" className="secondary-button">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="mis-cursos-grid">
          {cursos.map((inscripcion) => {
            const curso = inscripcion.curso
            const progreso = inscripcion.progreso
            const porcentaje = Number(progreso?.porcentaje || 0)

            return (
              <article
                className="curso-card"
                key={inscripcion.inscripcionId}
              >
                <div className="curso-card-imagen">
                  <BookOpen size={38} />
                </div>

                <div className="curso-card-contenido">
                  <span className="curso-categoria">
                    {curso.categoria || 'General'}
                  </span>

                  <h3>{curso.titulo}</h3>

                  <p className="curso-descripcion">
                    {curso.descripcion}
                  </p>

                  <p>
                    <GraduationCap size={16} />
                    {curso.instructor?.nombre || 'Instructor de MiniAula'}
                  </p>

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

                  <p className="progreso-lecciones">
                    <CheckCircle size={16} />
                    {progreso?.leccionesCompletadas || 0} de{' '}
                    {progreso?.totalLecciones || 0} lecciones completadas
                  </p>

                  <Link
                    to={`/mis-cursos/${curso.id}`}
                    className="curso-ver-detalle"
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
  )
}

function Profesores() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Profesores</h1>
        <p>Conoce a los instructores de MiniAula.</p>
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          <Users size={35} />
        </div>

        <h3>Profesores</h3>
        <p>
          Próximamente podrás consultar la información de los instructores.
        </p>
      </div>
    </section>
  )
}

function Perfil() {
  const { usuario } = useAuth()

  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Mi perfil</h1>
        <p>Consulta tu información personal.</p>
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          <UserRound size={35} />
        </div>

        <h3>{usuario?.nombre}</h3>
        <p>{usuario?.email}</p>
        <p>Rol: {usuario?.rol}</p>
      </div>
    </section>
  )
}

function InstructorHome() {
  const { usuario } = useAuth()

  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Panel del profesor</h1>
        <p>
          Bienvenido, {usuario?.nombre}. Administra tus cursos desde aquí.
        </p>
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          <BookOpen size={35} />
        </div>

        <h3>Tus cursos</h3>
        <p>Próximamente podrás crear y administrar tus cursos.</p>
      </div>
    </section>
  )
}

function RutaPrivada({ children, rol }) {
  const { autenticado, usuario, cargando } = useAuth()

  if (cargando) {
    return <div className="auth-loading">Cargando...</div>
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />
  }

  if (rol && usuario?.rol !== rol) {
    return (
      <Navigate
        to={usuario?.rol === 'instructor' ? '/instructor' : '/'}
        replace
      />
    )
  }

  return children
}

function Panel({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  )
}

function App() {
  const location = useLocation()
  const paginaAuth = ['/login', '/registro'].includes(location.pathname)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      <Route
        path="/"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <Inicio />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/catalogo"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <Catalogo />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/cursos/:id"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <CursoDetalle />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/mis-cursos"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <MisCursos />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/mis-cursos/:id"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <CursoInscrito />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/profesores"
        element={
          <RutaPrivada>
            <Panel>
              <Profesores />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/perfil"
        element={
          <RutaPrivada>
            <Panel>
              <Perfil />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <InstructorHome />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={paginaAuth ? location.pathname : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default App
