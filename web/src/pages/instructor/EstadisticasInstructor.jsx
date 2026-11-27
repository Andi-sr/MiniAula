import { useCallback, useEffect, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Users
} from 'lucide-react'

import { listarTodosCursosInstructor } from '../../services/instructor.service'
import { adaptarEstadisticasInstructor } from '../../services/estadisticas.service'
import { esSesionExpirada, interpretarError } from '../../services/errores'
import ErrorMessage from '../../components/ErrorMessage'
import { useAuth } from '../../context/AuthContext'
import './EstadisticasInstructor.css'

const TARJETAS_RESUMEN = [
  { clave: 'inscritos', etiqueta: 'Estudiantes inscritos', Icono: Users },
  { clave: 'progresoPromedio', etiqueta: 'Progreso promedio', Icono: TrendingUp },
  { clave: 'notaPromedio', etiqueta: 'Nota promedio', Icono: GraduationCap },
  { clave: 'completaronCurso', etiqueta: 'Completaron el curso', Icono: CheckCircle }
]

const TARJETAS_RESULTADOS = [
  { clave: 'evaluados', etiqueta: 'Estudiantes evaluados' },
  { clave: 'notaPromedio', etiqueta: 'Nota promedio' },
  { clave: 'aprobados', etiqueta: 'Aprobados' },
  { clave: 'agotaronIntentos', etiqueta: 'Agotaron intentos' }
]

function valorEstadistica(estadisticas, clave) {
  if (!estadisticas) return '—'

  const valor = clave === 'resultados'
    ? estadisticas.resultados?.notaPromedio
    : estadisticas[clave]

  if (valor === null || valor === undefined) return 'Sin evaluaciones'

  return clave === 'progresoPromedio' || clave === 'notaPromedio'
    ? `${valor}%`
    : valor
}

function TarjetaEstadistica({ etiqueta, valor, Icono, pendiente }) {
  return (
    <article className="estadistica-card">
      <div className="estadistica-card-icono">
        <Icono size={21} />
      </div>
      <p>{etiqueta}</p>
      <strong>{valor}</strong>
      {pendiente && <span>Pendiente de conexión</span>}
    </article>
  )
}

function BarraLeccion({ leccion, maximo, destacada }) {
  const llegaron = leccion.llegaron ?? 0
  const ancho = maximo > 0 ? Math.max(4, Math.round((llegaron / maximo) * 100)) : 0

  return (
    <div className={`estadistica-leccion${destacada ? ' destacada' : ''}`}>
      <div className="estadistica-leccion-cabecera">
        <span>
          Lección {leccion.orden ?? '—'}: {leccion.titulo}
        </span>
        <strong>{leccion.llegaron ?? '—'}</strong>
      </div>

      <div className="estadistica-barra">
        <span style={{ width: `${ancho}%` }}></span>
      </div>

      <small>
        {leccion.completaron === null || leccion.completaron === undefined
          ? 'Completadas: no disponible'
          : `Completaron: ${leccion.completaron}`}
      </small>
    </div>
  )
}

function EstadisticasInstructor() {
  const { cerrarSesion } = useAuth()

  const [cursos, setCursos] = useState([])
  const [cursoSeleccionado, setCursoSeleccionado] = useState('')
  const [cargando, setCargando] = useState(true)
  const [errorInfo, setErrorInfo] = useState(null)

  const cargarCursos = useCallback(async () => {
    try {
      setCargando(true)
      setErrorInfo(null)

      const respuesta = await listarTodosCursosInstructor()
      setCursos(respuesta.cursos)
    } catch (err) {
      if (esSesionExpirada(err)) {
        cerrarSesion()
        return
      }

      setCursos([])
      setErrorInfo(interpretarError(err, 'carga'))
    } finally {
      setCargando(false)
    }
  }, [cerrarSesion])

  useEffect(() => {
    Promise.resolve().then(() => cargarCursos())
  }, [cargarCursos])

  const cursoActivoId = cursos.some(
    (curso) => String(curso.id) === String(cursoSeleccionado)
  )
    ? cursoSeleccionado
    : cursos[0]?.id || ''
  const cursoActivo = cursos.find(
    (curso) => String(curso.id) === String(cursoActivoId)
  )

  const estadisticas = adaptarEstadisticasInstructor(null)
  const lecciones = estadisticas?.lecciones || []
  const maximoLecciones = lecciones.reduce(
    (maximo, leccion) => Math.max(maximo, leccion.llegaron || 0),
    0
  )
  const idMayorDisminucion = estadisticas?.mayorDisminucion?.hasta?.leccionId
  const sinEvaluaciones = !estadisticas?.resultados?.disponible

  return (
    <section className="catalogo-page estadisticas-page">
      <div className="instructor-encabezado">
        <div className="page-heading">
          <h1>Estadísticas de mis cursos</h1>
          <p>
            Consulta el progreso de tus estudiantes y descubre dónde necesitan
            más apoyo.
          </p>
        </div>
      </div>

      {cargando ? (
        <div className="catalogo-estado">
          <div className="catalogo-cargando"></div>
          <p>Cargando tus cursos...</p>
        </div>
      ) : errorInfo ? (
        <ErrorMessage
          {...errorInfo}
          onRetry={errorInfo.puedeReintentar ? cargarCursos : undefined}
        />
      ) : cursos.length === 0 ? (
        <div className="catalogo-estado">
          <BookOpen size={40} />
          <h3>Todavía no tienes cursos</h3>
          <p>Crea un curso para comenzar a consultar sus estadísticas.</p>
        </div>
      ) : (
        <>
          <div className="estadisticas-selector">
            <label htmlFor="curso-estadisticas">Curso</label>
            <select
              id="curso-estadisticas"
              value={cursoActivoId}
              onChange={(evento) => {
                setCursoSeleccionado(evento.target.value)
                setErrorInfo(null)
              }}
            >
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="estadisticas-tarjetas">
            {TARJETAS_RESUMEN.map(({ clave, etiqueta, Icono }) => (
              <TarjetaEstadistica
                key={clave}
                etiqueta={etiqueta}
                valor={valorEstadistica(estadisticas, clave)}
                Icono={Icono}
                pendiente={!estadisticas}
              />
            ))}
          </div>

          <div className="estadisticas-aviso">
            <AlertCircle size={20} />
            <div>
              <strong>Estadísticas en preparación.</strong>
              <p>
                Las estadísticas estarán disponibles cuando la API esté
                conectada. Mientras tanto, {cursoActivo?.titulo || 'el curso'}
                {' '}no tiene datos de ejemplo.
              </p>
            </div>
          </div>

          <section className="estadisticas-seccion">
            <div className="estadisticas-seccion-titulo">
              <BarChart3 size={22} />
              <div>
                <h2>Estudiantes por lección</h2>
                <p>Avance real del curso, lección por lección.</p>
              </div>
            </div>

            {estadisticas && estadisticas.inscritos === 0 ? (
              <p className="estadisticas-vacio">
                Todavía no hay estudiantes inscritos en este curso.
              </p>
            ) : lecciones.length > 0 ? (
              <div className="estadisticas-lecciones">
                {lecciones.map((leccion) => (
                  <BarraLeccion
                    key={leccion.leccionId || leccion.titulo}
                    leccion={leccion}
                    maximo={maximoLecciones}
                    destacada={leccion.leccionId === idMayorDisminucion}
                  />
                ))}
              </div>
            ) : (
              <p className="estadisticas-vacio">
                Aún no hay información suficiente para identificar dónde
                disminuye el avance.
              </p>
            )}

            {estadisticas?.mayorDisminucion && (
              <div className="estadisticas-disminucion">
                <TrendingUp size={19} />
                <p>
                  {estadisticas.mayorDisminucion.diferencia} estudiantes
                  {' '}llegaron a la lección {estadisticas.mayorDisminucion.desde.orden}
                  {' '}({estadisticas.mayorDisminucion.desde.titulo}), pero no
                  {' '}avanzaron a la lección {estadisticas.mayorDisminucion.hasta.orden}
                  {' '}({estadisticas.mayorDisminucion.hasta.titulo}).
                </p>
              </div>
            )}
          </section>

          <section className="estadisticas-seccion">
            <div className="estadisticas-seccion-titulo">
              <ClipboardList size={22} />
              <div>
                <h2>Resultados de evaluaciones</h2>
                <p>Resumen agregado, sin notas individuales.</p>
              </div>
            </div>

            {sinEvaluaciones ? (
              <p className="estadisticas-vacio">Sin evaluaciones</p>
            ) : (
              <div className="estadisticas-resultados">
                {TARJETAS_RESULTADOS.map(({ clave, etiqueta }) => (
                  <div key={clave} className="estadisticas-resultado">
                    <span>{etiqueta}</span>
                    <strong>
                      {estadisticas.resultados[clave] === null ||
                      estadisticas.resultados[clave] === undefined
                        ? '—'
                        : clave === 'notaPromedio'
                          ? `${estadisticas.resultados[clave]}%`
                          : estadisticas.resultados[clave]}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default EstadisticasInstructor
