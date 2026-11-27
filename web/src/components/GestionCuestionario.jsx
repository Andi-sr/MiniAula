import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Pencil,
  Plus,
  Save,
  Trash2,
  X
} from 'lucide-react'

import FormularioPregunta from './FormularioPregunta'
import ModalConfirmacion from './ModalConfirmacion'
import './Cuestionarios.css'

function crearBorrador(leccion) {
  return {
    titulo: '',
    instrucciones: '',
    notaMinima: '',
    preguntas: [],
    leccionId: leccion?.id ?? null,
    leccionTitulo: leccion?.titulo || ''
  }
}

function GestionCuestionario({ leccion, onCerrar, onGuardar }) {
  const [borrador, setBorrador] = useState(() => crearBorrador(leccion))
  const [preguntaEditando, setPreguntaEditando] = useState(null)
  const [confirmacion, setConfirmacion] = useState(null)
  const [estado, setEstado] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const cerrarConEscape = (evento) => {
      if (evento.key === 'Escape' && !preguntaEditando && !confirmacion) {
        onCerrar()
      }
    }

    document.addEventListener('keydown', cerrarConEscape)
    return () => document.removeEventListener('keydown', cerrarConEscape)
  }, [confirmacion, onCerrar, preguntaEditando])

  const backendDisponible = typeof onGuardar === 'function'

  const abrirNuevaPregunta = () => {
    setEstado(null)
    setPreguntaEditando({ indice: -1, pregunta: null })
  }

  const abrirEdicion = (indice) => {
    setEstado(null)
    setPreguntaEditando({ indice, pregunta: borrador.preguntas[indice] })
  }

  const guardarPregunta = (pregunta) => {
    setBorrador((actual) => {
      const preguntas = [...actual.preguntas]

      if (preguntaEditando.indice >= 0) {
        preguntas[preguntaEditando.indice] = pregunta
      } else {
        preguntas.push(pregunta)
      }

      return { ...actual, preguntas }
    })

    setPreguntaEditando(null)
    setEstado({
      tipo: 'info',
      mensaje: 'Pregunta agregada al borrador. Todavía no se ha guardado en el servidor.'
    })
  }

  const confirmarEliminacion = () => {
    if (confirmacion === null) return

    setBorrador((actual) => ({
      ...actual,
      preguntas: actual.preguntas.filter((_, indice) => indice !== confirmacion)
    }))
    setConfirmacion(null)
    setEstado({
      tipo: 'info',
      mensaje: 'Pregunta eliminada del borrador. Todavía no se ha guardado en el servidor.'
    })
  }

  const intentarGuardar = async () => {
    setEstado(null)

    if (!borrador.titulo.trim()) {
      setEstado({
        tipo: 'error',
        mensaje: 'Escribe el título del cuestionario.'
      })
      return
    }

    if (borrador.preguntas.length === 0) {
      setEstado({
        tipo: 'error',
        mensaje: 'Agrega al menos una pregunta antes de continuar.'
      })
      return
    }

    const nota = borrador.notaMinima === ''
      ? null
      : Number(borrador.notaMinima)

    if (nota !== null && (!Number.isFinite(nota) || nota < 0)) {
      setEstado({
        tipo: 'error',
        mensaje: 'La nota mínima debe ser un número válido.'
      })
      return
    }

    if (!backendDisponible) {
      setEstado({
        tipo: 'error',
        mensaje: 'El backend de cuestionarios todavía no está disponible. El borrador no se ha guardado.'
      })
      return
    }

    try {
      setGuardando(true)

      await onGuardar({
        ...borrador,
        titulo: borrador.titulo.trim(),
        instrucciones: borrador.instrucciones.trim(),
        notaMinima: nota
      })

      setEstado({
        tipo: 'exito',
        mensaje: 'Cuestionario guardado correctamente.'
      })
    } catch (err) {
      setEstado({
        tipo: 'error',
        mensaje: err?.respuesta?.data?.error?.message || 'No pudimos guardar el cuestionario. Intenta nuevamente.'
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="cuestionario-overlay">
      <div
        className="cuestionario-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-gestion-cuestionario"
      >
        <header className="cuestionario-modal-header">
          <div>
            <h2 id="titulo-gestion-cuestionario">Cuestionario</h2>
            <p>
              Lección: {borrador.leccionTitulo || ' sin título'}
            </p>
          </div>

          <button
            type="button"
            className="cuestionario-icono"
            aria-label="Cerrar gestión de cuestionario"
            onClick={onCerrar}
          >
            <X size={19} />
          </button>
        </header>

        <div className="cuestionario-modal-body">
          <div className="cuestionario-aviso">
            <AlertCircle size={19} />
            <p>
              Preparación RF-14: el borrador funciona en esta pantalla. La
              conexión con preguntas, intentos y calificación se activará
              cuando el backend expose los endpoints.
            </p>
          </div>

          <div className="cuestionario-campos">
            <label>
              Título del cuestionario
              <input
                type="text"
                value={borrador.titulo}
                placeholder={`Cuestionario de ${borrador.leccionTitulo || 'la lección'}`}
                onChange={(evento) => setBorrador((actual) => ({
                  ...actual,
                  titulo: evento.target.value
                }))}
              />
            </label>

            <label>
              Instrucciones
              <textarea
                rows={3}
                value={borrador.instrucciones}
                placeholder="Indicaciones para responder el cuestionario"
                onChange={(evento) => setBorrador((actual) => ({
                  ...actual,
                  instrucciones: evento.target.value
                }))}
              />
            </label>

            <label>
              Nota mínima de aprobación
              <input
                type="number"
                min="0"
                step="1"
                value={borrador.notaMinima}
                placeholder="Según regla del backend"
                onChange={(evento) => setBorrador((actual) => ({
                  ...actual,
                  notaMinima: evento.target.value
                }))}
              />
            </label>
          </div>

          <div className="cuestionario-lista">
            <div className="cuestionario-lista-cabecera">
              <div>
                <h3>Preguntas</h3>
                <p>{borrador.preguntas.length} en este borrador</p>
              </div>

              <button
                type="button"
                className="cuestionario-boton"
                onClick={abrirNuevaPregunta}
              >
                <Plus size={15} />
                Agregar pregunta
              </button>
            </div>

            {borrador.preguntas.length === 0 ? (
              <p className="cuestionario-vacio">
                Todavía no hay preguntas en este borrador.
              </p>
            ) : (
              borrador.preguntas.map((pregunta, indice) => (
                <article key={`${indice}-${pregunta.enunciado}`} className="cuestionario-pregunta-card">
                  <div className="cuestionario-pregunta-cabecera">
                    <h4>
                      {indice + 1}. {pregunta.enunciado}
                    </h4>

                    <div className="cuestionario-pregunta-acciones">
                      <button
                        type="button"
                        className="cuestionario-icono"
                        aria-label={`Editar pregunta ${indice + 1}`}
                        title="Editar pregunta"
                        onClick={() => abrirEdicion(indice)}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="cuestionario-icono peligro"
                        aria-label={`Eliminar pregunta ${indice + 1}`}
                        title="Eliminar pregunta"
                        onClick={() => setConfirmacion(indice)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <ul>
                    {pregunta.opciones.map((opcion, indiceOpcion) => (
                      <li
                        key={`${indiceOpcion}-${opcion}`}
                        className={indiceOpcion === pregunta.correcta ? 'correcta' : ''}
                      >
                        {opcion}
                        {indiceOpcion === pregunta.correcta && (
                          <CheckCircle size={14} />
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              ))
            )}
          </div>

          {estado && (
            <div className={`cuestionario-estado ${estado.tipo}`}>
              {estado.tipo === 'error'
                ? <AlertCircle size={18} />
                : estado.tipo === 'exito'
                  ? <CheckCircle size={18} />
                  : <ClipboardList size={18} />}
              <p>{estado.mensaje}</p>
            </div>
          )}
        </div>

        <footer className="cuestionario-modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onCerrar}
          >
            <X size={16} />
            Cerrar
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={guardando}
            onClick={intentarGuardar}
          >
            <Save size={16} />
            {guardando ? 'Guardando...' : 'Guardar cuestionario'}
          </button>
        </footer>

        {preguntaEditando && (
          <div className="cuestionario-overlay interno">
            <div className="cuestionario-modal interno" role="dialog" aria-modal="true">
              <header className="cuestionario-modal-header">
                <div>
                  <h2>
                    {preguntaEditando.indice >= 0
                      ? 'Editar pregunta'
                      : 'Nueva pregunta'}
                  </h2>
                  <p>Define enunciado, opciones y respuesta correcta.</p>
                </div>
              </header>

              <FormularioPregunta
                key={preguntaEditando.indice}
                pregunta={preguntaEditando.pregunta}
                onGuardar={guardarPregunta}
                onCancelar={() => setPreguntaEditando(null)}
              />
            </div>
          </div>
        )}

        <ModalConfirmacion
          abierto={confirmacion !== null}
          titulo="Eliminar pregunta"
          mensaje="¿Eliminar esta pregunta del borrador?"
          confirmarTexto="Eliminar"
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setConfirmacion(null)}
        />
      </div>
    </div>
  )
}

export default GestionCuestionario
