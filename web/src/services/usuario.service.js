import api from './api'

export async function obtenerMiPerfil() {
  const { data } = await api.get('/users/me')
  return data.usuario
}

export function actualizarMiPerfil(datos) {
  return api.put('/users/me', datos)
}
