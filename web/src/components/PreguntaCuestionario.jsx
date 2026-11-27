function PreguntaCuestionario({
  pregunta,
  numero,
  respuesta,
  onSeleccionar,
  deshabilitado
}) {
  return (
    <article className="cuestionario-pregunta">
      <header>
        <span>Pregunta {numero}</span>
        <h3>{pregunta.enunciado}</h3>
      </header>

      <div
        className="cuestionario-opciones"
        role="radiogroup"
        aria-label={`Opciones de la pregunta ${numero}`}
      >
        {pregunta.opciones.map((opcion) => (
          <label
            key={opcion.id}
            className={
              respuesta === opcion.id
                ? 'cuestionario-opcion seleccionada'
                : 'cuestionario-opcion'
            }
          >
            <input
              type="radio"
              name={`pregunta-${pregunta.id}`}
              value={opcion.id}
              checked={respuesta === opcion.id}
              onChange={() => onSeleccionar(pregunta.id, opcion.id)}
              disabled={deshabilitado}
            />
            <span aria-hidden="true" />
            <strong>{opcion.texto}</strong>
          </label>
        ))}
      </div>
    </article>
  )
}

export default PreguntaCuestionario
