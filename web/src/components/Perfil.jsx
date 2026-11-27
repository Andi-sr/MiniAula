import { useEffect, useState } from 'react'
import {
  UserRound,
  Mail,
  CheckCircle,
  Pencil
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { obtenerMiPerfil } from '../services/usuario.service'
import { interpretarError, esSesionExpirada } from '../services/errores'
import ErrorMessage from './ErrorMessage'
import '../pages/Auth.css'
import './Perfil.css'

function Perfil() {
  const { usuario, actualizarPerfil, cerrarSesion } = useAuth()

  const [perfil, setPerfil] = useState(usuario)
  const [editando, setEditando] = useState(false)
  const [formulario, setFormulario] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || ''
  })
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let activo = true

    const cargarPerfil = async () => {
      try {
        setErrorInfo(null)

        const datos = await obtenerMiPerfil()

        if (!activo) return

        setPerfil(datos)
        setFormulario({
          nombre: datos.nombre || '',
          email: datos.email || ''
        })
      } catch (err) {
        if (!activo) return

        if (esSesionExpirada(err)) {
          cerrarSesion()
          return
        }

        setErrorInfo(interpretarError(err, 'perfil'))
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    Promise.resolve().then(() => cargarPerfil())

    return () => {
      activo = false
    }
  }, [cerrarSesion, intento])

  const abrirEdicion = () => {
    setFormulario({
      nombre: perfil?.nombre || '',
      email: perfil?.email || ''
    })
    setErrorInfo(null)
    setMensaje('')
    setEditando(true)
  }

  const cancelarEdicion = () => {
    setEditando(false)
    setErrorInfo(null)
  }

  const validarFormulario = () => {
    const nombre = formulario.nombre.trim()
    const email = formulario.email.trim()

    if (nombre.length < 2 || nombre.length > 100) {
      return 'El nombre debe tener entre 2 y 100 caracteres.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Correo electrónico inválido.'
    }

    return ''
  }

  const guardarPerfil = async (evento) => {
    evento.preventDefault()

    const validacion = validarFormulario()

    if (validacion) {
      setErrorInfo({
        titulo: 'Revisa los datos',
        mensaje: validacion
      })
      return
    }

    try {
      setGuardando(true)
      setErrorInfo(null)
      setMensaje('')

      const datos = await actualizarPerfil({
        nombre: formulario.nombre.trim(),
        email: formulario.email.trim().toLowerCase()
      })

      setPerfil(datos.usuario)
      setMensaje(datos.mensaje || 'Perfil actualizado correctamente')
      setEditando(false)
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setErrorInfo(interpretarError(err, 'perfil'))
    } finally {
      setGuardando(false)
    }
  }

  const reintentarCarga = () => {
    setCargando(true)
    setErrorInfo(null)
    setIntento((valor) => valor + 1)
  }

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

        {cargando ? (
          <p>Cargando tu perfil...</p>
        ) : (
          <>
            <div className="perfil-valores">
              <h3>{perfil?.nombre || usuario?.nombre}</h3>
              <p>{perfil?.email || usuario?.email}</p>
              <p>Rol: {perfil?.rol || usuario?.rol}</p>
            </div>

            {mensaje && (
              <div className="perfil-mensaje exito">
                <CheckCircle size={18} />
                {mensaje}
              </div>
            )}

            <ErrorMessage
              {...errorInfo}
              variante="perfil"
              onRetry={errorInfo?.puedeReintentar ? reintentarCarga : undefined}
            />

            {editando ? (
              <form className="perfil-form" onSubmit={guardarPerfil}>
                <label htmlFor="perfil-nombre">Nombre completo</label>
                <div className="auth-input">
                  <UserRound size={19} />
                  <input
                    id="perfil-nombre"
                    name="nombre"
                    type="text"
                    minLength={2}
                    maxLength={100}
                    required
                    value={formulario.nombre}
                    onChange={(evento) => {
                      setFormulario({
                        ...formulario,
                        nombre: evento.target.value
                      })
                      setErrorInfo(null)
                    }}
                  />
                </div>

                <label htmlFor="perfil-email">Correo electrónico</label>
                <div className="auth-input">
                  <Mail size={19} />
                  <input
                    id="perfil-email"
                    name="email"
                    type="email"
                    required
                    value={formulario.email}
                    onChange={(evento) => {
                      setFormulario({
                        ...formulario,
                        email: evento.target.value
                      })
                      setErrorInfo(null)
                    }}
                  />
                </div>

                <div className="perfil-acciones">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={cancelarEdicion}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                    {!guardando && <CheckCircle size={18} />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="perfil-acciones">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={abrirEdicion}
                >
                  <Pencil size={15} />
                  Editar perfil
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default Perfil
