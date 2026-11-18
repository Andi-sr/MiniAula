
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon">🎓</span>
        <h2>MiniAula</h2>
      </div>

      <p className="menu-label">MENÚ PRINCIPAL</p>

      <nav className="menu">
        <NavLink to="/" end>🏠 Inicio</NavLink>
        <NavLink to="/mis-cursos">📚 Mis clases</NavLink>
        <NavLink to="/profesores">👩‍🏫 Profesores</NavLink>
        <NavLink to="/perfil">👤 Mi perfil</NavLink>
      </nav>

      <div className="sidebar-footer">
        <span>✨</span>
        <p>¡Aprender es divertido!</p>
      </div>
    </aside>
  )
}

function Inicio() {
  return (
    <>
      <header className="topbar">
        <div>
          <h1>¡Hola, Mateo! 👋</h1>
          <p>¿Listo para aprender algo nuevo hoy?</p>
        </div>
        <div className="user-avatar">M</div>
      </header>

      <section className="welcome-card">
        <div>
          <span className="welcome-tag">¡BIENVENIDO A MINIAULA!</span>
          <h2>Aprender es una aventura</h2>
          <p>Explora tus clases y descubre todo lo que puedes aprender.</p>
          <NavLink to="/mis-cursos" className="primary-button">
            Ver mis clases →
          </NavLink>
        </div>
        <div className="welcome-illustration">📚🌈</div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <h2>Mis clases</h2>
            <p>Continúa aprendiendo y divirtiéndote.</p>
          </div>
          <NavLink to="/mis-cursos">Ver todas →</NavLink>
        </div>

        <div className="empty-state">
          <span>🎒</span>
          <h3>Tus clases aparecerán aquí</h3>
          <p>Cuando inicies sesión y te inscribas, podrás ver tus cursos.</p>
        </div>
      </section>
    </>
  )
}

function MisCursos() {
  return <h2>Mis clases</h2>
}

function Profesores() {
  return <h2>Profesores</h2>
}

function Perfil() {
  return <h2>Mi perfil</h2>
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
