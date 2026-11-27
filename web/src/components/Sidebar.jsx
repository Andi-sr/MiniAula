import { NavLink } from 'react-router-dom'
import {
  GraduationCap,
  House,
  BookOpen,
  BookOpenCheck,
  Users,
  UserRound,
  Search,
  LogOut,
  BarChart3
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

function Sidebar() {
  const { usuario, cerrarSesion } = useAuth()
  const esInstructor = usuario?.rol === 'instructor'

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
        {esInstructor ? (
          <>
            <NavLink to="/instructor" end>
              <House size={20} />
              <span>Inicio</span>
            </NavLink>

            <NavLink to="/instructor/cursos" end>
              <BookOpen size={20} />
              <span>Mis cursos</span>
            </NavLink>

            <NavLink to="/instructor/estadisticas" end>
              <BarChart3 size={20} />
              <span>Estadísticas</span>
            </NavLink>

            <NavLink to="/instructor/cursos/nuevo" end>
              <BookOpenCheck size={20} />
              <span>Crear curso</span>
            </NavLink>

            <NavLink to="/perfil">
              <UserRound size={20} />
              <span>Mi perfil</span>
            </NavLink>
          </>
        ) : (
          <>
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
          </>
        )}
      </nav>

      <div className="sidebar-logout">
        <button
          className="logout-button"
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
