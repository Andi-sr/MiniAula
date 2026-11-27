import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { BookOpen, AlertCircle } from 'lucide-react'

import {
  buscarCursoInstructor,
  editarCurso
} from '../../services/instructor.service'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import FormularioCurso from './FormularioCurso'
import './Instructor.css'

function EditarCurso() {
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

  const guardarCambios = async (datos) => {
    try {
      setGuardando(true)
      setErrorInfo(null)

      const respuesta = await editarCurso(id, datos)

      navigate('/instructor/cursos', {
        state: {
          mensaje:
            respuesta.data.mensaje || 'Curso actualizado correctamente.'
        }
      })
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setErrorInfo(interpretarError(err, 'curso'))
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
        <h1>Editar curso</h1>
        <p>Actualiza la información de tu curso.</p>
      </div>

      <div className="instructor-form-card">
        <h2>Datos del curso</h2>
        <p>Los cambios se guardarán inmediatamente en tu curso.</p>

        <FormularioCurso
          key={curso.id}
          curso={curso}
          onSubmit={guardarCambios}
          guardando={guardando}
          errorInfo={errorInfo}
          onLimpiarError={() => setErrorInfo(null)}
          textoBoton="Guardar cambios"
        />
      </div>

      <NavLink
        to={`/instructor/cursos/${id}/lecciones`}
        className="instructor-boton"
      >
        <BookOpen size={14} />
        Administrar lecciones
      </NavLink>
    </section>
  )
}

export default EditarCurso
