import { AlertCircle, RotateCcw } from 'lucide-react'

import './ErrorMessage.css'

function normalizarDetalles(detalles) {
  if (!Array.isArray(detalles)) return []

  return detalles
    .map((detalle) => (
      typeof detalle === 'string'
        ? { campo: '', mensaje: detalle }
        : {
          campo: typeof detalle?.campo === 'string' ? detalle.campo : '',
          mensaje: typeof detalle?.mensaje === 'string' ? detalle.mensaje : ''
        }
    ))
    .filter((detalle) => detalle.mensaje.trim() !== '')
    .filter((detalle, indice, lista) => (
      lista.findIndex((item) => item.mensaje === detalle.mensaje) === indice
    ))
}

function ErrorMessage({
  titulo = 'No se pudo completar la acción',
  mensaje = '',
  codigo = '',
  detalles = [],
  onRetry,
  reintentando = false,
  variante = 'instructor',
  className = ''
}) {
  const detallesVisibles = normalizarDetalles(detalles).filter(
    (detalle) => detalle.mensaje !== mensaje
  )
  const clases = [
    'error-message',
    `error-message--${variante}`,
    className
  ].filter(Boolean).join(' ')

  if (!mensaje && detallesVisibles.length === 0 && !codigo) {
    return null
  }

  return (
    <div className={clases} role="alert" aria-live="polite">
      <div className="error-message-cabecera">
        <AlertCircle size={18} />
        <div>
          <strong>{titulo}</strong>
          {mensaje && <p>{mensaje}</p>}
        </div>
      </div>

      {detallesVisibles.length > 0 && (
        <ul className="error-message-detalles">
          {detallesVisibles.map((detalle, indice) => (
            <li key={`${detalle.campo || 'detalle'}-${indice}`}>
              {detalle.campo && (
                <span className="error-message-campo">{detalle.campo}:</span>
              )}
              {' '}
              {detalle.mensaje}
            </li>
          ))}
        </ul>
      )}

      {codigo && (
        <span className="error-message-codigo">Código: {codigo}</span>
      )}

      {onRetry && (
        <button
          type="button"
          className="error-message-reintento"
          onClick={onRetry}
          disabled={reintentando}
        >
          <RotateCcw size={14} />
          {reintentando ? 'Reintentando...' : 'Reintentar'}
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
