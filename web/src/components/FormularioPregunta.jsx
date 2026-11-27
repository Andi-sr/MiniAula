import { useState } from 'react'
import { Check, Plus, Trash2, X } from 'lucide-react'

function FormularioPregunta({ pregunta, onGuardar, onCancelar }) {
  const [enunciado, setEnunciado] = useState(pregunta?.enunciado || '')
  const [opciones, setOpciones] = useState(() => {
    const iniciales = pregunta?.opciones?.length
      ? pregunta.opciones
      : ['', '']
    let contador = 1

    return iniciales.map((texto) => ({ id: contador++, texto }))
  })
  const [siguienteId, setSiguienteId] = useState(() => opciones.length + 1)
  const [correcta, setCorrecta] = useState(() => {
    if (pregunta?.correcta === undefined || pregunta?.correcta === null) {
      return null
    }

    return pregunta.correcta + 1
  })
  const [error, setError] = useState('')

  const cambiarOpcion = (id, texto) => {
    setOpciones((actuales) => actuales.map((opcion) => (
      opcion.id === id ? { ...opcion, texto } : opcion
    )))
  }

  const agregarOpcion = () => {
    setOpciones((actuales) => [
      ...actuales,
      { id: siguienteId, texto: '' }
    ])
    setSiguienteId((actual) => actual + 1)
  }

  const eliminarOpcion = (id) => {
    setOpciones((actuales) => actuales.filter((opcion) => opcion.id !== id))

    if (correcta === id) {
      setCorrecta(null)
    }
  }

  const guardar = (evento) => {
    evento.preventDefault()

    const textoEnunciado = enunciado.trim()
    const textos = opciones.map((opcion) => opcion.texto.trim())

    if (!textoEnunciado) {
      setError('Escribe el enunciado de la pregunta.')
      return
    }

    if (textos.length < 2 || textos.some((texto) => !texto)) {
      setError('Agrega al menos dos opciones y completa todas las respuestas.')
      return
    }

    if (correcta === null) {
      setError('Selecciona la opción correcta.')
      return
    }

    const indiceCorrecta = opciones.findIndex((opcion) => opcion.id === correcta)

    if (indiceCorrecta < 0) {
      setError('Selecciona una opción válida como respuesta correcta.')
      return
    }

    setError('')
    onGuardar({
      enunciado: textoEnunciado,
      opciones: textos,
      correcta: indiceCorrecta
    })
  }

  return (
    <form className="cuestionario-pregunta-form" onSubmit={guardar}>
      <label>
        Enunciado
        <textarea
          value={enunciado}
          onChange={(evento) => setEnunciado(evento.target.value)}
          rows={3}
          placeholder="Escribe la pregunta para tus estudiantes"
        />
      </label>

      <fieldset>
        <legend>Opciones de respuesta</legend>

        {opciones.map((opcion, indice) => (
          <div className="cuestionario-opcion" key={opcion.id}>
            <input
              type="radio"
              name="respuesta-correcta"
              aria-label={`Marcar opción ${indice + 1} como correcta`}
              checked={correcta === opcion.id}
              onChange={() => setCorrecta(opcion.id)}
            />

            <input
              type="text"
              value={opcion.texto}
              onChange={(evento) => cambiarOpcion(opcion.id, evento.target.value)}
              placeholder={`Opción ${indice + 1}`}
              aria-label={`Texto de la opción ${indice + 1}`}
            />

            <button
              type="button"
              className="cuestionario-icono"
              aria-label={`Eliminar opción ${indice + 1}`}
              title="Eliminar opción"
              onClick={() => eliminarOpcion(opcion.id)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="cuestionario-boton"
          onClick={agregarOpcion}
        >
          <Plus size={15} />
          Agregar opción
        </button>
      </fieldset>

      {error && <p className="cuestionario-error">{error}</p>}

      <div className="cuestionario-form-acciones">
        <button type="submit" className="primary-button">
          <Check size={16} />
          Guardar pregunta
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={onCancelar}
        >
          <X size={16} />
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioPregunta
