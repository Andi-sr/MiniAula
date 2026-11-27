import { AlertCircle } from 'lucide-react'

function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  confirmarTexto = 'Confirmar',
  cancelarTexto = 'Cancelar',
  cargando = false,
  onConfirmar,
  onCancelar
}) {
  if (!abierto) {
    return null
  }

  return (
    <div
      className="instructor-modal-overlay"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget && !cargando) {
          onCancelar()
        }
      }}
    >
      <section
        className="instructor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacion"
      >
        <div className="empty-icon">
          <AlertCircle size={30} />
        </div>

        <h3 id="titulo-confirmacion">{titulo}</h3>
        <p>{mensaje}</p>

        <div className="instructor-modal-acciones">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancelar}
            disabled={cargando}
          >
            {cancelarTexto}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : confirmarTexto}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ModalConfirmacion
