import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

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

export default RutaPrivada
