import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'
import { interpretarError } from '../services/errores'

const useCursos = () => {
  const [cursos, setCursos] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  const [cargando, setCargando] = useState(true)
  const [errorInfo, setErrorInfo] = useState(null)

  const pedirCursos = useCallback(() => api.get('/cursos', {
    params: {
      q: busqueda.trim() || undefined,
      categoria: categoria.trim() || undefined,
      page: pagina,
      limit: 9
    }
  }), [busqueda, categoria, pagina])

  const aplicarCursos = useCallback((respuesta) => {
    setCursos(respuesta.data.cursos || [])
    setTotal(respuesta.data.total || 0)
    setTotalPaginas(respuesta.data.totalPages || 1)
    setErrorInfo(null)
  }, [])

  const aplicarError = useCallback((err) => {
    setCursos([])
    setTotal(0)
    setTotalPaginas(1)
    setErrorInfo(interpretarError(err, 'carga'))
  }, [])

  const finalizarCarga = useCallback(() => setCargando(false), [])

  const ejecutarCarga = useCallback(
    () => pedirCursos()
      .then(aplicarCursos)
      .catch(aplicarError)
      .finally(finalizarCarga),
    [pedirCursos, aplicarCursos, aplicarError, finalizarCarga]
  )

  useEffect(() => {
    ejecutarCarga()
  }, [ejecutarCarga])

  const iniciarCarga = useCallback(() => {
    setCargando(true)
    setErrorInfo(null)
  }, [])

  const buscarCursos = (nuevaBusqueda, nuevaCategoria) => {
    if (
      nuevaBusqueda === busqueda &&
      nuevaCategoria === categoria &&
      pagina === 1
    ) {
      return
    }

    iniciarCarga()
    setPagina(1)
    setBusqueda(nuevaBusqueda)
    setCategoria(nuevaCategoria)
  }

  const cambiarPagina = (nuevaPagina) => {
    if (
      nuevaPagina >= 1 &&
      nuevaPagina <= totalPaginas &&
      nuevaPagina !== pagina
    ) {
      iniciarCarga()
      setPagina(nuevaPagina)
    }
  }

  const recargar = useCallback(() => {
    iniciarCarga()
    return ejecutarCarga()
  }, [iniciarCarga, ejecutarCarga])

  const limpiarError = useCallback(() => setErrorInfo(null), [])

  return {
    cursos,
    total,
    pagina,
    totalPaginas,
    busqueda,
    categoria,
    cargando,
    error: errorInfo?.mensaje || '',
    errorInfo,
    buscarCursos,
    cambiarPagina,
    recargar,
    limpiarError
  }
}

export default useCursos
