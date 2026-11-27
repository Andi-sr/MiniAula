import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { crearCurso } from '../../services/instructor.service'
import { interpretarError, esSesionExpirada } from '../../services/errores'
import { useAuth } from '../../context/AuthContext'
import FormularioCurso from './FormularioCurso'
import './Instructor.css'

function CrearCurso() {
  const navigate = useNavigate()
  const { cerrarSesion } = useAuth()

  const [guardando, setGuardando] = useState(false)
  const [errorInfo, setErrorInfo] = useState(null)

  const guardarCurso = async (datos) => {
    try {
      setGuardando(true)
      setErrorInfo(null)

      const respuesta = await crearCurso(datos)

      navigate('/instructor/cursos', {
        state: {
          mensaje:
            respuesta.data.mensaje || 'Curso creado correctamente.'
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

  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Crear curso</h1>
        <p>Completa la información principal de tu nuevo curso.</p>
      </div>

      <div className="instructor-form-card">
        <h2>Datos del curso</h2>
        <p>
          El curso quedará guardado como borrador. Podrás agregar lecciones y
          publicarlo más adelante.
        </p>

        <FormularioCurso
          onSubmit={guardarCurso}
          guardando={guardando}
          errorInfo={errorInfo}
          onLimpiarError={() => setErrorInfo(null)}
          textoBoton="Crear curso"
        />
      </div>
    </section>
  )
}

export default CrearCurso
