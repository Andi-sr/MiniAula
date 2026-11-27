import { useCallback, useEffect, useState } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import {
  BookOpen,
  Video,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  ClipboardList
} from 'lucide-react'

import {
  buscarCursoInstructor,
  listarLeccionesCurso,
  reordenarLecciones,
  eliminarLeccion
} from '../../services/instructor.service'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import ModalConfirmacion from '../../components/ModalConfirmacion'
import VideoPreview from '../../components/VideoPreview'
import GestionCuestionario from '../../components/GestionCuestionario'
import './Instructor.css'
import './LeccionesInstructor.css'

function LeccionesInstructor() {
  const { id } = useParams()
  const location = useLocation()
  const { cerrarSesion } = useAuth()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [reordenando, setReordenando] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)
  const [mensaje, setMensaje] = useState(location.state?.mensaje || '')
  const [accion, setAccion] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [videoPath, setVideoPath] = useState('')
  const [cuestionarioLeccion, setCuestionarioLeccion] = useState(null)

  const cargarLecciones = useCallback(async () => {
    try {
      setCargando(true)
      setErrorInfo(null)

      const [curso, lecciones] = await Promise.all([
        buscarCursoInstructor(id),
        listarLeccionesCurso(id)
      ])

      if (!curso) {
        setErrorInfo({
          titulo: 'Curso no disponible',
          mensaje: 'No encontramos este curso entre los cursos de tu cuenta.'
        })
        return
      }

      setDatos({ curso, lecciones })
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setErrorInfo(interpretarError(err, 'carga'))
    } finally {
      setCargando(false)
    }
  }, [cerrarSesion, id])

  useEffect(() => {
    Promise.resolve().then(() => cargarLecciones())
  }, [cargarLecciones])

  useEffect(() => {
    if (!menuAbierto) return undefined

    const cerrarMenu = (evento) => {
      if (!evento.target.closest('.instructor-menu')) {
        setMenuAbierto(null)
      }
    }

    document.addEventListener('click', cerrarMenu)
    return () => document.removeEventListener('click', cerrarMenu)
  }, [menuAbierto])

  const abrirAccion = (nuevaAccion) => {
    setErrorInfo(null)
    setMensaje('')
    setMenuAbierto(null)
    setAccion(nuevaAccion)
  }

  const confirmarAccion = async () => {
    if (!accion || !datos) return

    const { tipo, leccion, indice, direccion } = accion

    try {
      if (tipo === 'mover') {
        setReordenando(true)

        const destino = indice + direccion
        const ordenAnterior = datos.lecciones
        const nuevoOrden = [...ordenAnterior]
        const temporal = nuevoOrden[indice]
        nuevoOrden[indice] = nuevoOrden[destino]
        nuevoOrden[destino] = temporal

        setDatos((actual) => ({ ...actual, lecciones: nuevoOrden }))

        const respuesta = await reordenarLecciones(
          id,
          nuevoOrden.map((item) => item.id)
        )
        const leccionesGuardadas = respuesta.data.lecciones

        if (Array.isArray(leccionesGuardadas) && leccionesGuardadas.length) {
          setDatos((actual) => ({
            ...actual,
            lecciones: leccionesGuardadas
          }))
        }

        setMensaje(
          respuesta.data.mensaje || 'Orden de lecciones actualizado.'
        )
      } else {
        setProcesando(true)

        await eliminarLeccion(leccion.id)
        setMensaje('Lección eliminada correctamente.')
        await cargarLecciones()
      }

      setAccion(null)
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      if (tipo === 'mover' && accion.ordenAnterior) {
        setDatos((actual) => ({ ...actual, lecciones: accion.ordenAnterior }))
      }

      setAccion(null)
      setErrorInfo(interpretarError(err, 'leccion'))
    } finally {
      setReordenando(false)
      setProcesando(false)
    }
  }

  const obtenerConfirmacion = () => {
    if (!accion) {
      return { titulo: '', mensaje: '', confirmarTexto: 'Confirmar' }
    }

    if (accion.tipo === 'eliminar') {
      return {
        titulo: 'Eliminar lección',
        mensaje: `¿Eliminar "${accion.leccion.titulo}"? Se eliminará también su video y se reordenarán las lecciones restantes.`,
        confirmarTexto: 'Eliminar'
      }
    }

    return {
      titulo: 'Reordenar lección',
      mensaje: `¿Mover "${accion.leccion.titulo}" una posición hacia ${accion.direccion < 0 ? 'arriba' : 'abajo'}?`,
      confirmarTexto: 'Mover'
    }
  }

  const confirmacion = obtenerConfirmacion()

  if (cargando) {
    return (
      <section className="page-section">
        <div className="catalogo-estado">
          <div className="catalogo-cargando"></div>
          <p>Cargando lecciones...</p>
        </div>
      </section>
    )
  }

  if (errorInfo && !datos) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <div className="empty-icon">
            <AlertCircle size={35} />
          </div>

          <h3>No pudimos cargar las lecciones</h3>
          <ErrorMessage
            {...errorInfo}
            onRetry={errorInfo.puedeReintentar ? () => cargarLecciones() : undefined}
          />

          <NavLink to="/instructor/cursos" className="secondary-button">
            Volver a mis cursos
          </NavLink>
        </div>
      </section>
    )
  }

  const { curso, lecciones } = datos

  return (
    <section className="catalogo-page">
      <div className="instructor-encabezado">
        <div className="page-heading">
          <h1>Lecciones de {curso.titulo}</h1>
          <p>Organiza el contenido y el orden de tu curso.</p>
        </div>

        <div className="instructor-acciones">
          <NavLink
            to={`/instructor/cursos/${id}/lecciones/nueva`}
            className="primary-button"
          >
            <Plus size={17} />
            Agregar lección
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

      <div className="catalogo-resultados">
        <div>
          <h2>Temario</h2>
          <p>
            {lecciones.length}{' '}
            {lecciones.length === 1 ? 'lección' : 'lecciones'} en este curso
          </p>
        </div>
      </div>

      {lecciones.length === 0 ? (
        <div className="catalogo-estado">
          <BookOpen size={40} />
          <h3>Todavía no hay lecciones</h3>
          <p>
            Usa el botón Agregar lección para crear la primera y poder publicar
            tu curso.
          </p>
        </div>
      ) : (
        <div className="instructor-lecciones">
          {lecciones.map((leccion, indice) => {
            const editable = leccion.tipo === 'contenido'
            const puedeSubir = indice > 0
            const puedeBajar = indice < lecciones.length - 1
            const bloqueado = reordenando || procesando

            return (
              <article
                className="instructor-leccion-card"
                key={leccion.id}
              >
                <div className="instructor-leccion-numero">
                  {leccion.orden ?? indice + 1}
                </div>

                <div className="instructor-leccion-info">
                  <h3>{leccion.titulo}</h3>
                  <span>
                    {leccion.tipo === 'cuestionario'
                      ? 'Cuestionario'
                      : 'Lección de contenido'}

                    {leccion.videoPath && (
                      <span className="instructor-video-indicador">
                        <Video size={13} />
                        Con video
                      </span>
                    )}
                  </span>
                </div>

                <div className="instructor-menu">
                  <button
                    type="button"
                    className="instructor-icon-button"
                    aria-label={`Más acciones para ${leccion.titulo}`}
                    aria-expanded={menuAbierto === leccion.id}
                    title="Más acciones"
                    onClick={() => setMenuAbierto(
                      menuAbierto === leccion.id ? null : leccion.id
                    )}
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {menuAbierto === leccion.id && (
                    <div className="instructor-menu-desplegable">
                      <button
                        type="button"
                        className="instructor-menu-opcion"
                        disabled={!puedeSubir || bloqueado}
                        onClick={() => abrirAccion({
                          tipo: 'mover',
                          leccion,
                          indice,
                          direccion: -1,
                          ordenAnterior: lecciones
                        })}
                      >
                        <ArrowUp size={14} />
                        Subir
                      </button>

                      <button
                        type="button"
                        className="instructor-menu-opcion"
                        disabled={!puedeBajar || bloqueado}
                        onClick={() => abrirAccion({
                          tipo: 'mover',
                          leccion,
                          indice,
                          direccion: 1,
                          ordenAnterior: lecciones
                        })}
                      >
                        <ArrowDown size={14} />
                        Bajar
                      </button>

                      {leccion.videoPath && (
                        <button
                          type="button"
                          className="instructor-menu-opcion"
                          disabled={bloqueado}
                          onClick={() => {
                            setMenuAbierto(null)
                            setVideoPath(leccion.videoPath)
                          }}
                        >
                          <Eye size={14} />
                          Ver video
                        </button>
                      )}

                      {editable && (
                        <NavLink
                          to={`/instructor/cursos/${id}/lecciones/${leccion.id}/editar`}
                          className="instructor-menu-opcion"
                          onClick={() => setMenuAbierto(null)}
                        >
                          <Pencil size={14} />
                          Editar
                        </NavLink>
                      )}

                      {editable && (
                        <button
                          type="button"
                          className="instructor-menu-opcion"
                          disabled={bloqueado}
                          onClick={() => {
                            setMenuAbierto(null)
                            setCuestionarioLeccion(leccion)
                          }}
                        >
                          <ClipboardList size={14} />
                          Cuestionario
                        </button>
                      )}

                      {editable && (
                        <button
                          type="button"
                          className="instructor-menu-opcion peligro"
                          disabled={bloqueado}
                          onClick={() => abrirAccion({
                            tipo: 'eliminar',
                            leccion
                          })}
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ModalConfirmacion
        abierto={Boolean(accion)}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        confirmarTexto={confirmacion.confirmarTexto}
        cargando={procesando || reordenando}
        onConfirmar={confirmarAccion}
        onCancelar={() => setAccion(null)}
      />

      {videoPath && (
        <VideoPreview
          key={videoPath}
          videoPath={videoPath}
          onCerrar={() => setVideoPath('')}
        />
      )}

      {cuestionarioLeccion && (
        <GestionCuestionario
          key={cuestionarioLeccion.id}
          leccion={cuestionarioLeccion}
          onCerrar={() => setCuestionarioLeccion(null)}
        />
      )}
    </section>
  )
}

export default LeccionesInstructor
