
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { GraduationCap, UserRound, Mail, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Register() {
  const { registrar, autenticado, usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'estudiante'
  })
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
      const data = await registrar(formulario)
      navigate(data.usuario.rol === 'instructor' ? '/instructor' : '/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'No se pudo completar el registro.')
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
          <h1>Crea tu cuenta</h1>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="nombre">Nombre completo</label>
          <div className="auth-input">
            <UserRound size={19} />
            <input id="nombre" name="nombre" type="text" placeholder="Tu nombre" value={formulario.nombre} onChange={handleChange} minLength={2} maxLength={100} required />
          </div>
          <label htmlFor="email">Correo electrónico</label>
          <div className="auth-input">
            <Mail size={19} />
            <input id="email" name="email" type="email" placeholder="nombre@correo.com" value={formulario.email} onChange={handleChange} required />
          </div>
          <label htmlFor="password">Contraseña</label>
          <div className="auth-input">
            <Lock size={19} />
            <input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" value={formulario.password} onChange={handleChange} minLength={8} required />
          </div>
          <label htmlFor="rol">Tipo de cuenta</label>
          <select id="rol" name="rol" className="auth-select" value={formulario.rol} onChange={handleChange}>
            <option value="estudiante">Estudiante</option>
            <option value="instructor">Profesor</option>
          </select>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={enviando}>
            {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
            {!enviando && <ArrowRight size={18} />}
          </button>
        </form>
        <p className="auth-switch">¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
      </section>
      <aside className="auth-aside">
        <div className="auth-aside-content">
          <GraduationCap size={58} strokeWidth={1.3} />
          <h2>Tu aprendizaje comienza aquí</h2>
          <p>Forma parte de una comunidad educativa donde cada lección cuenta.</p>
        </div>
      </aside>
    </main>
  )
}

export default Register
