import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

import {
  buscarCursoInstructor,
  crearLeccion
} from '../../services/instructor.service'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import FormularioLeccion from './FormularioLeccion'
import './Instructor.css'

function CrearLeccion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cerrarSesion } = useAuth()

  const [curso, setCurso] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)

  const cargarCurso = useCallback(async () => {
    try {
      setCargando(true)
      setErrorInfo(null)

      const encontrado = await buscarCursoInstructor(id)

      if (!encontrado) {
        setErrorInfo({
          titulo: 'Curso no disponible',
          mensaje: 'No encontramos este curso entre los cursos de tu cuenta.'
        })
        return
      }

      setCurso(encontrado)
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
    Promise.resolve().then(() => cargarCurso())
  }, [cargarCurso])

  const guardarLeccion = async (datos, opciones) => {
    try {
      setGuardando(true)
      setErrorInfo(null)

      const respuesta = await crearLeccion(id, datos, opciones.archivoVideo)

      navigate(`/instructor/cursos/${id}/lecciones`, {
        state: {
          mensaje:
            respuesta.data.mensaje || 'Lección creada correctamente.'
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
          <p>Cargando el curso...</p>
        </div>
      </section>
    )
  }

  if (errorInfo && !curso) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <div className="empty-icon">
            <AlertCircle size={35} />
          </div>

          <h3>No pudimos abrir el curso</h3>
          <ErrorMessage
            {...errorInfo}
            onRetry={errorInfo.puedeReintentar ? () => cargarCurso() : undefined}
          />

          <Link to="/instructor/cursos" className="secondary-button">
            Volver a mis cursos
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Nueva lección</h1>
        <p>Agrega contenido a "{curso.titulo}".</p>
      </div>

      <div className="instructor-form-card">
        <h2>Datos de la lección</h2>
        <p>
          Puedes guardar una lección solo con texto o agregar un video MP4,
          WebM o MOV.
        </p>

        <FormularioLeccion
          cursoId={id}
          onSubmit={guardarLeccion}
          guardando={guardando}
          errorInfo={errorInfo}
          onLimpiarError={() => setErrorInfo(null)}
          textoBoton="Crear lección"
        />
      </div>
    </section>
  )
}

export default CrearLeccion
