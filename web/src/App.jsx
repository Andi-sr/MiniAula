
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import {
  GraduationCap, House, BookOpen, Users, UserRound,
  BookOpenCheck, ArrowRight, Bell, Search
} from 'lucide-react'
import './App.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><GraduationCap size={28} /></div>
        <h2>MiniAula</h2>
      </div>

      <p className="menu-label">MENÚ PRINCIPAL</p>
      <nav className="menu">
        <NavLink to="/" end><House size={20} /><span>Inicio</span></NavLink>
        <NavLink to="/mis-cursos"><BookOpen size={20} /><span>Mis clases</span></NavLink>
        <NavLink to="/profesores"><Users size={20} /><span>Profesores</span></NavLink>
        <NavLink to="/perfil"><UserRound size={20} /><span>Mi perfil</span></NavLink>
      </nav>

      <div className="sidebar-footer">
        <GraduationCap size={25} />
        <p>Un espacio para aprender y crecer.</p>
      </div>
    </aside>
  )
}

function Inicio() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>¡Hola, bienvenido!</h1>
          <p>¿Listo para aprender algo nuevo hoy?</p>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Buscar"><Search size={20} /></button>
          <button className="icon-button" aria-label="Notificaciones"><Bell size={20} /></button>
          <div className="user-avatar">U</div>
        </div>
      </header>

      <section className="welcome-card">
        <div className="welcome-content">
          <span className="welcome-tag">BIENVENIDO A MINIAULA</span>
          <h2>Aprender es una aventura</h2>
          <p>Explora tus clases, desarrolla nuevas habilidades y continúa avanzando en tu aprendizaje.</p>
          <NavLink to="/mis-cursos" className="primary-button">
            Explorar mis clases <ArrowRight size={17} />
          </NavLink>
        </div>
        <div className="welcome-illustration"><BookOpenCheck size={105} strokeWidth={1.2} /></div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>Mis clases</h2>
            <p>Continúa aprendiendo a tu propio ritmo.</p>
          </div>
          <NavLink to="/mis-cursos">Ver todas <ArrowRight size={15} /></NavLink>
        </div>

        <div className="empty-state">
          <div className="empty-icon"><BookOpen size={35} /></div>
          <h3>Tus clases aparecerán aquí</h3>
          <p>Cuando te inscribas en un curso, podrás acceder a tus lecciones y consultar tu progreso.</p>
          <NavLink to="/mis-cursos" className="secondary-button">Ver mis clases</NavLink>
        </div>
      </section>
    </>
  )
}

function MisCursos() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Mis clases</h1>
        <p>Consulta y continúa tus cursos inscritos.</p>
      </div>
      <div className="empty-state">
        <div className="empty-icon"><BookOpen size={35} /></div>
        <h3>Aún no tienes clases</h3>
        <p>Cuando te inscribas en un curso, aparecerá aquí.</p>
      </div>
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
        <div className="empty-icon"><Users size={35} /></div>
        <h3>Profesores</h3>
        <p>Próximamente podrás consultar la información de los instructores.</p>
      </div>
    </section>
  )
}

function Perfil() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Mi perfil</h1>
        <p>Consulta y administra tu información personal.</p>
      </div>
      <div className="empty-state">
        <div className="empty-icon"><UserRound size={35} /></div>
        <h3>Mi información</h3>
        <p>Los datos de tu cuenta aparecerán aquí cuando iniciemos sesión.</p>
      </div>
    </section>
  )
}

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/mis-cursos" element={<MisCursos />} />
          <Route path="/profesores" element={<Profesores />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
