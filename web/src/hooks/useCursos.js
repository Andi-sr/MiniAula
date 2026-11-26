import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

const useCursos = () => {
  const [cursos, setCursos] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const obtenerCursos = useCallback(async () => {
    try {
      setCargando(true)
      setError('')

      const respuesta = await api.get('/cursos', {
        params: {
          q: busqueda.trim() || undefined,
          categoria: categoria.trim() || undefined,
          page: pagina,
          limit: 9
        }
      })

      setCursos(respuesta.data.cursos || [])
      setTotal(respuesta.data.total || 0)
      setTotalPaginas(respuesta.data.totalPages || 1)
    } catch (err) {
      setCursos([])
      setTotal(0)
      setTotalPaginas(1)

      setError(
        err.response?.data?.error?.message ||
        'No se pudieron cargar los cursos. Intenta nuevamente.'
      )
    } finally {
      setCargando(false)
    }
  }, [busqueda, categoria, pagina])

  useEffect(() => {
    obtenerCursos()
  }, [obtenerCursos])

  const buscarCursos = (nuevaBusqueda, nuevaCategoria) => {
    setPagina(1)
    setBusqueda(nuevaBusqueda)
    setCategoria(nuevaCategoria)
  }

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPagina(nuevaPagina)
    }
  }

  return {
    cursos,
    total,
    pagina,
    totalPaginas,
    busqueda,
    categoria,
    cargando,
    error,
    buscarCursos,
    cambiarPagina,
    recargar: obtenerCursos
  }
}

export default useCursos