import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  GraduationCap
} from 'lucide-react'

import api from '../../services/api'
import { esSesionExpirada, interpretarError } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import './MisCursos.css'

function obtenerTextoAccion(porcentaje) {
  if (porcentaje >= 100) return 'Repasar'
  if (porcentaje > 0) return 'Continuar'
  return 'Empezar'
}

function MisCursos() {
  const { cerrarSesion } = useAuth()
  const [cursos, setCursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorInfo, setErrorInfo] = useState(null)

  const pedirMisCursos = useCallback(
    () => api.get('/inscripciones/mis-cursos'),
    []
  )

  const aplicarCursos = useCallback((respuesta) => {
    setCursos(respuesta.data.cursos || [])
    setErrorInfo(null)
  }, [])

  const aplicarError = useCallback((err) => {
    if (esSesionExpirada(err)) {
      cerrarSesion()
      return
    }

    setErrorInfo(interpretarError(err, 'carga'))
  }, [cerrarSesion])

  const finalizarCarga = useCallback(() => setCargando(false), [])

  const ejecutarCarga = useCallback(
    () => pedirMisCursos()
      .then(aplicarCursos)
      .catch(aplicarError)
      .finally(finalizarCarga),
    [pedirMisCursos, aplicarCursos, aplicarError, finalizarCarga]
  )

  useEffect(() => {
    Promise.resolve().then(() => ejecutarCarga())
  }, [ejecutarCarga])

  const iniciarCarga = useCallback(() => {
    setCargando(true)
    setErrorInfo(null)
  }, [])

  const recargar = useCallback(() => {
    iniciarCarga()
    return ejecutarCarga()
  }, [iniciarCarga, ejecutarCarga])

  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Mis clases</h1>
        <p>Consulta tus cursos inscritos y continúa aprendiendo.</p>
      </div>

      {cargando ? (
        <div className="empty-state">
          <p>Cargando tus cursos...</p>
        </div>
      ) : errorInfo ? (
        <div className="empty-state">
          <BookOpen size={35} />
          <h3>No pudimos cargar tus clases</h3>

          <ErrorMessage
            {...errorInfo}
            onRetry={errorInfo.puedeReintentar ? recargar : undefined}
          />
        </div>
      ) : cursos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <BookOpen size={35} />
          </div>

          <h3>Aún no tienes clases</h3>
          <p>Cuando te inscribas en un curso, aparecerá aquí.</p>

          <Link to="/catalogo" className="secondary-button">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="mis-clases-lista">
          {cursos.map((inscripcion) => {
            const curso = inscripcion.curso
            const progreso = inscripcion.progreso
            const porcentaje = Number(progreso?.porcentaje || 0)
            const porcentajeSeguro = Math.min(100, Math.max(0, porcentaje))
            const completadas = Number(progreso?.leccionesCompletadas || 0)
            const totalLecciones = Number(progreso?.totalLecciones || 0)
            const textoAccion = obtenerTextoAccion(porcentajeSeguro)

            return (
              <article
                className="mis-clase-fila"
                key={inscripcion.inscripcionId}
              >
                <div className="mis-clase-portada">
                  <BookOpen size={38} strokeWidth={1.5} />
                </div>

                <div className="mis-clase-info">
                  <div className="mis-clase-encabezado">
                    {curso.categoria && (
                      <span className="mis-clase-categoria">
                        {curso.categoria}
                      </span>
                    )}
                    <h3>{curso.titulo}</h3>
                  </div>

                  {curso.instructor?.nombre && (
                    <p className="mis-clase-instructor">
                      <GraduationCap size={15} />
                      Instructor: {curso.instructor.nombre}
                    </p>
                  )}

                  <div className="mis-clase-progreso">
                    <span>
                      {completadas} de {totalLecciones} lecciones ·{' '}
                      {porcentajeSeguro} %
                    </span>

                    <div className="mis-clase-barra">
                      <span
                        style={{ width: `${porcentajeSeguro}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Link
                  to={`/mis-cursos/${curso.id}`}
                  className="mis-clase-accion"
                  aria-label={`${textoAccion} ${curso.titulo}`}
                >
                  {textoAccion}
                  <ArrowRight size={18} />
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default MisCursos
