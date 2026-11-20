
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Login() {
  const { iniciarSesion, autenticado, usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (cargando) return <div className="auth-loading">Cargando...</div>
  if (autenticado) return <Navigate to={usuario?.rol === 'instructor' ? '/instructor' : '/'} replace />

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)

    try {
      const data = await iniciarSesion(formulario)
      navigate(data.usuario.rol === 'instructor' ? '/instructor' : '/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudo iniciar sesión. Verifica tus datos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <GraduationCap size={30} />
          <span>MiniAula</span>
        </Link>
        <div className="auth-heading">
          <h1>Bienvenido de nuevo</h1>
          <p>Ingresa a tu cuenta para continuar aprendiendo.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email">Correo electrónico</label>
          <div className="auth-input">
            <Mail size={19} />
            <input id="email" name="email" type="email" placeholder="nombre@correo.com" value={formulario.email} onChange={handleChange} required />
          </div>
          <label htmlFor="password">Contraseña</label>
          <div className="auth-input">
            <Lock size={19} />
            <input id="password" name="password" type="password" placeholder="Ingresa tu contraseña" value={formulario.password} onChange={handleChange} required />
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Iniciar sesión'}
            {!enviando && <ArrowRight size={18} />}
          </button>
        </form>
        <p className="auth-switch">¿Todavía no tienes cuenta? <Link to="/registro">Regístrate</Link></p>
      </section>
      <aside className="auth-aside">
        <div className="auth-aside-content">
          <GraduationCap size={58} strokeWidth={1.3} />
          <h2>Aprender abre nuevas posibilidades</h2>
          <p>Explora tus cursos, aprende a tu ritmo y descubre todo lo que puedes lograr.</p>
        </div>
      </aside>
    </main>
  )
}

export default Login
