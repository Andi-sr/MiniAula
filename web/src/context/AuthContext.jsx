
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setCargando(false)
      return
    }

    api.get('/auth/sesion')
      .then(({ data }) => {
        setUsuario(data.usuario)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        setUsuario(null)
      })
      .finally(() => setCargando(false))
  }, [])

  const registrar = async (datos) => {
    const { data } = await api.post('/auth/register', datos)
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data
  }

  const iniciarSesion = async (datos) => {
    const { data } = await api.post('/auth/login', datos)
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      registrar,
      iniciarSesion,
      cerrarSesion
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  }

  return context
}
