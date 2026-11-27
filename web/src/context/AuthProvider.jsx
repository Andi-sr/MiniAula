import { useCallback, useEffect, useRef, useState } from 'react'

import api from '../services/api'
import { esSesionExpirada } from '../services/errores'
import { actualizarMiPerfil } from '../services/usuario.service'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(
    () => Boolean(localStorage.getItem('token'))
  )
  const sesionSolicitada = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) return undefined
    if (sesionSolicitada.current) return undefined

    sesionSolicitada.current = true

    api.get('/auth/sesion')
      .then(({ data }) => {
        setUsuario(data.usuario)
        localStorage.setItem('usuario', JSON.stringify(data.usuario))
      })
      .catch((error) => {
        if (!esSesionExpirada(error)) return

        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        setUsuario(null)
      })
      .finally(() => setCargando(false))
  }, [])

  const registrar = useCallback(async (datos) => {
    const { data } = await api.post('/auth/register', datos)
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data
  }, [])

  const iniciarSesion = useCallback(async (datos) => {
    const { data } = await api.post('/auth/login', datos)
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data
  }, [])

  const actualizarPerfil = useCallback(async (datos) => {
    const { data } = await actualizarMiPerfil(datos)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setUsuario(data.usuario)
    return data
  }, [])

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      autenticado: Boolean(usuario),
      registrar,
      iniciarSesion,
      actualizarPerfil,
      cerrarSesion
    }}>
      {children}
    </AuthContext.Provider>
  )
}
