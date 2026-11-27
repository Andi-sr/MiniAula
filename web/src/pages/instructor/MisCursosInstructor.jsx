import { useCallback, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle,
  Archive,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import {
  listarTodosCursosInstructor,
  listarLeccionesCurso,
  cambiarEstadoCurso,
  eliminarCurso
} from '../../services/instructor.service'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import ModalConfirmacion from '../../components/ModalConfirmacion'
import './Instructor.css'
import './MisCursosInstructor.css'

const TAMANO_PAGINA = 10
const FILTROS_ESTADO = [
  { valor: 'todos', etiqueta: 'Todos' },
  { valor: 'borrador', etiqueta: 'Borradores' },
  { valor: 'publicado', etiqueta: 'Publicados' },
  { valor: 'archivado', etiqueta: 'Archivados' }
]
const MENSAJES_FILTRO_VACIO = {
  borrador: 'No tienes cursos en borrador.',
  publicado: 'No tienes cursos publicados.',
  archivado: 'No tienes cursos archivados.'
}

function MisCursosInstructor() {
  const { cerrarSesion } = useAuth()
  const location = useLocation()

  const [cursos, setCursos] = useState([])
  const [conteoLecciones, setConteoLecciones] = useState({})
  const [conteoError, setConteoError] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [errorInfo, setErrorInfo] = useState(null)
  const [mensaje, setMensaje] = useState(location.state?.mensaje || '')
  const [accion, setAccion] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const cargarCursos = useCallback(async () => {
    try {
      setCargando(true)
      setErrorInfo(null)
      setConteoError(false)

      const respuesta = await listarTodosCursosInstructor()

      setCursos(respuesta.cursos)
      setTotal(respuesta.total)

      const conteos = {}
      let falloConteo = false

      await Promise.all(
        respuesta.cursos.map(async (curso) => {
          try {
            const lecciones = await listarLeccionesCurso(curso.id)
            conteos[curso.id] = lecciones.length
          } catch {
            conteos[curso.id] = null
            falloConteo = true
          }
        })
      )

      setConteoLecciones(conteos)
      setConteoError(falloConteo)
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setCursos([])
      setConteoLecciones({})
      setErrorInfo(interpretarError(err, 'carga'))
    } finally {
      setCargando(false)
    }
  }, [cerrarSesion])

  useEffect(() => {
    Promise.resolve().then(() => cargarCursos())
  }, [cargarCursos])

  const abrirAccion = (tipo, curso) => {
    setErrorInfo(null)
    setMensaje('')
    setAccion({ tipo, curso })
  }

  const cancelarAccion = () => {
    setAccion(null)
  }

  const confirmarAccion = async () => {
    if (!accion) return

    const { tipo, curso } = accion

    try {
      setProcesando(true)
      setErrorInfo(null)
      setMensaje('')

      let texto = ''

      if (tipo === 'publicar') {
        const respuesta = await cambiarEstadoCurso(curso.id, 'publicado')
        texto = respuesta.data.mensaje || 'Curso publicado correctamente.'
      } else if (tipo === 'archivar') {
        const respuesta = await cambiarEstadoCurso(curso.id, 'archivado')
        texto = respuesta.data.mensaje || 'Curso archivado correctamente.'
      } else {
        await eliminarCurso(curso.id)
        texto = 'Curso eliminado correctamente.'
      }

      setAccion(null)
      setMensaje(texto)

      await cargarCursos()
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setAccion(null)
      setErrorInfo(interpretarError(err, 'accion'))
    } finally {
      setProcesando(false)
    }
  }

  const cambiarFiltro = (estado) => {
    setFiltroEstado(estado)
    setPagina(1)
    setMensaje('')
    setErrorInfo(null)
  }

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setMensaje('')
      setErrorInfo(null)
      setPagina(nuevaPagina)
    }
  }

  const obtenerConfirmacion = () => {
    if (!accion) {
      return { titulo: '', mensaje: '', confirmarTexto: 'Confirmar' }
    }

    if (accion.tipo === 'publicar') {
      return {
        titulo: 'Publicar curso',
        mensaje: `¿Publicar "${accion.curso.titulo}"? El curso debe tener al menos una lección para estar disponible en el catálogo.`,
        confirmarTexto: 'Publicar'
      }
    }

    if (accion.tipo === 'archivar') {
      return {
        titulo: 'Archivar curso',
        mensaje: `¿Archivar "${accion.curso.titulo}"? El curso dejará de mostrarse como publicado.`,
        confirmarTexto: 'Archivar'
      }
    }

    return {
      titulo: 'Eliminar curso',
      mensaje: `¿Eliminar "${accion.curso.titulo}"? Esta acción no se puede deshacer.`,
      confirmarTexto: 'Eliminar'
    }
  }

  const confirmacion = obtenerConfirmacion()

  const cursosFiltrados = filtroEstado === 'todos'
    ? cursos
    : cursos.filter((curso) => curso.estado === filtroEstado)
  const totalVisible = cursosFiltrados.length
  const totalPaginas = Math.max(1, Math.ceil(totalVisible / TAMANO_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const cursosVisibles = cursosFiltrados.slice(
    (paginaActual - 1) * TAMANO_PAGINA,
    paginaActual * TAMANO_PAGINA
  )

  const permitirPublicar = (curso) => (
    curso.estado !== 'publicado' && (conteoLecciones[curso.id] || 0) > 0
  )
  const permitirEliminar = (curso) => (
    curso.estado === 'borrador' && conteoLecciones[curso.id] === 0
  )

  return (
    <section className="catalogo-page">
      <div className="instructor-encabezado">
        <div className="page-heading">
          <h1>Mis cursos</h1>
          <p>Consulta y administra los cursos que has creado.</p>
        </div>

        <div className="instructor-acciones">
          <NavLink
            to="/instructor/cursos/nuevo"
            className="primary-button"
          >
            Nuevo curso
          </NavLink>
        </div>
      </div>

      {mensaje && (
        <div className="instructor-mensaje exito">
          <CheckCircle size={18} />
          {mensaje}
        </div>
      )}

      <ErrorMessage {...errorInfo} />

      {conteoError && cursos.length > 0 && (
        <ErrorMessage
          titulo="No se pudo verificar el número de lecciones"
          mensaje="Algunas acciones no están disponibles hasta volver a intentarlo."
          onRetry={() => cargarCursos()}
        />
      )}

      <div className="catalogo-resultados instructor-resultados">
        <div>
          <h2>Todos tus cursos</h2>
          <p>
            {total} {total === 1 ? 'curso' : 'cursos'} en total
          </p>
        </div>

        <div className="instructor-filtro">
          <div
            className="filtro-estados"
            role="group"
            aria-label="Filtrar cursos por estado"
          >
            {FILTROS_ESTADO.map(({ valor, etiqueta }) => (
              <button
                key={valor}
                type="button"
                className={filtroEstado === valor ? 'activo' : undefined}
                aria-pressed={filtroEstado === valor}
                onClick={() => cambiarFiltro(valor)}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          <p className="catalogo-visible">
            {totalVisible} {totalVisible === 1 ? 'curso' : 'cursos'} visibles
          </p>
        </div>
      </div>

      {cargando ? (
        <div className="catalogo-estado">
          <div className="catalogo-cargando"></div>
          <p>Cargando tus cursos...</p>
        </div>
      ) : errorInfo && cursos.length === 0 ? (
        <div className="catalogo-estado catalogo-error">
          <BookOpen size={35} />
          <h3>No se pudieron cargar tus cursos</h3>

          <ErrorMessage
            {...errorInfo}
            onRetry={() => cargarCursos()}
          />
        </div>
      ) : cursos.length === 0 ? (
        <div className="catalogo-estado">
          <BookOpen size={40} />
          <h3>Aún no tienes cursos</h3>
          <p>Crea tu primer curso para comenzar a organizar lecciones.</p>

          <NavLink
            to="/instructor/cursos/nuevo"
            className="primary-button"
          >
            Crear mi primer curso
          </NavLink>
        </div>
      ) : cursosVisibles.length === 0 ? (
        <div className="catalogo-estado">
          <BookOpen size={40} />
          <h3>
            {MENSAJES_FILTRO_VACIO[filtroEstado] ||
              'No hay cursos para este filtro.'}
          </h3>
          <p>Selecciona otro filtro para ver tus cursos.</p>
        </div>
      ) : (
        <>
          <div className="catalogo-grid">
            {cursosVisibles.map((curso) => (
              <article
                className="curso-card instructor-curso-card"
                key={curso.id}
              >
                <div className="curso-card-imagen">
                  <BookOpen size={38} />
                </div>

                <div className="curso-card-contenido">
                  <span className="curso-categoria">
                    {curso.categoria || 'General'}
                  </span>

                  <h3>{curso.titulo}</h3>

                  <p className="curso-descripcion">
                    {curso.descripcion || 'Sin descripción.'}
                  </p>

                  <div className="instructor-curso-meta">
                    <span className={`instructor-estado ${curso.estado}`}>
                      {curso.estado}
                    </span>
                    <span>{curso.nivel || 'Nivel general'}</span>
                    {conteoLecciones[curso.id] !== null &&
                    conteoLecciones[curso.id] !== undefined ? (
                      <span>
                        {conteoLecciones[curso.id]}{' '}
                        {conteoLecciones[curso.id] === 1
                          ? 'lección'
                          : 'lecciones'}
                      </span>
                    ) : (
                      <span>Lecciones: no disponible</span>
                    )}
                  </div>

                  <div className="instructor-curso-acciones">
                    <NavLink
                      to={`/instructor/cursos/${curso.id}/editar`}
                      className="instructor-boton"
                    >
                      <Pencil size={14} />
                      Editar
                    </NavLink>

                    <NavLink
                      to={`/instructor/cursos/${curso.id}/lecciones`}
                      className="instructor-boton"
                    >
                      <BookOpen size={14} />
                      Lecciones
                    </NavLink>

                    {curso.estado !== 'publicado' && (
                      <button
                        type="button"
                        className="instructor-boton"
                        onClick={() => abrirAccion('publicar', curso)}
                        disabled={!permitirPublicar(curso)}
                        title={
                          permitirPublicar(curso)
                            ? undefined
                            : 'Agrega al menos una lección para publicar este curso.'
                        }
                      >
                        <CheckCircle size={14} />
                        Publicar
                      </button>
                    )}

                    {curso.estado !== 'archivado' && (
                      <button
                        type="button"
                        className="instructor-boton"
                        onClick={() => abrirAccion('archivar', curso)}
                      >
                        <Archive size={14} />
                        Archivar
                      </button>
                    )}

                    {curso.estado === 'borrador' && (
                      <button
                        type="button"
                        className="instructor-boton peligro"
                        onClick={() => abrirAccion('eliminar', curso)}
                        disabled={!permitirEliminar(curso)}
                        title={
                          permitirEliminar(curso)
                            ? undefined
                            : 'Elimina primero las lecciones de este curso.'
                        }
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="catalogo-paginacion">
              <button
                type="button"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={19} />
              </button>

              <span>
                Página {paginaActual} de {totalPaginas}
              </span>

              <button
                type="button"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                aria-label="Página siguiente"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          )}
        </>
      )}

      <ModalConfirmacion
        abierto={Boolean(accion)}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        confirmarTexto={confirmacion.confirmarTexto}
        cargando={procesando}
        onConfirmar={confirmarAccion}
        onCancelar={cancelarAccion}
      />
    </section>
  )
}

export default MisCursosInstructor
