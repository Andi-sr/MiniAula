import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

import {
  buscarCursoInstructor,
  obtenerLeccionInstructor,
  editarLeccion
} from '../../services/instructor.service'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import FormularioLeccion from './FormularioLeccion'
import './Instructor.css'

function EditarLeccion() {
  const { id, leccionId } = useParams()
  const navigate = useNavigate()
  const { cerrarSesion } = useAuth()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true)
      setErrorInfo(null)

      const [curso, leccion] = await Promise.all([
        buscarCursoInstructor(id),
        obtenerLeccionInstructor(id, leccionId)
      ])

      if (!curso || !leccion) {
        setErrorInfo({
          titulo: 'Lección no disponible',
          mensaje: 'No encontramos esta lección entre los cursos de tu cuenta.'
        })
        return
      }

      setDatos({ curso, leccion })
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setErrorInfo(interpretarError(err, 'carga'))
    } finally {
      setCargando(false)
    }
  }, [cerrarSesion, id, leccionId])

  useEffect(() => {
    Promise.resolve().then(() => cargarDatos())
  }, [cargarDatos])

  const guardarLeccion = async (formulario, opciones) => {
    try {
      setGuardando(true)
      setErrorInfo(null)

      const respuesta = await editarLeccion(
        leccionId,
        formulario,
        opciones
      )

      navigate(`/instructor/cursos/${id}/lecciones`, {
        state: {
          mensaje:
            respuesta.data.mensaje || 'Lección actualizada correctamente.'
        }
      })
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setErrorInfo(interpretarError(err, 'leccion'))
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <p>Cargando la lección...</p>
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

          <h3>No pudimos abrir la lección</h3>
          <ErrorMessage
            {...errorInfo}
            onRetry={errorInfo.puedeReintentar ? () => cargarDatos() : undefined}
          />

          <Link
            to={`/instructor/cursos/${id}/lecciones`}
            className="secondary-button"
          >
            Volver a las lecciones
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Editar lección</h1>
        <p>
          Actualiza el contenido de "{datos.leccion.titulo}" en "
          {datos.curso.titulo}".
        </p>
      </div>

      <div className="instructor-form-card">
        <h2>Datos de la lección</h2>
        <p>
          Si no seleccionas un video nuevo, conservaremos el video actual.
        </p>

        <FormularioLeccion
          cursoId={id}
          leccion={datos.leccion}
          onSubmit={guardarLeccion}
          guardando={guardando}
          errorInfo={errorInfo}
          onLimpiarError={() => setErrorInfo(null)}
          textoBoton="Guardar cambios"
        />
      </div>
    </section>
  )
}

export default EditarLeccion
