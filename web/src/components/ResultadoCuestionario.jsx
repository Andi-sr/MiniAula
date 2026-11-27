import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react'

function ResultadoCuestionario({ resultado, siguienteHref, temarioHref }) {
  const aprobado = resultado.aprobado
  const claseEstado = aprobado === true
    ? 'aprobado'
    : aprobado === false
      ? 'no-aprobado'
      : 'pendiente'

  return (
    <article className="cuestionario-resultado">
      <div className={`cuestionario-resultado-estado ${claseEstado}`}>
        {aprobado === true ? (
          <CheckCircle size={26} />
        ) : (
          <AlertCircle size={26} />
        )}

        <div>
          <span>Resultado</span>
          <h2>
            {aprobado === true
              ? 'Aprobado'
              : aprobado === false
                ? 'No aprobado'
                : 'Estado no disponible'}
          </h2>
        </div>

        <strong>
          {resultado.nota === null ? '—' : `${resultado.nota} / 100`}
        </strong>
      </div>

      <dl className="cuestionario-resultado-datos">
        <div>
          <dt>Mejor nota obtenida</dt>
          <dd>
            {resultado.mejorNota === null ? '—' : `${resultado.mejorNota} / 100`}
          </dd>
        </div>

        <div>
          <dt>Intentos utilizados</dt>
          <dd>{resultado.intentosUtilizados ?? '—'}</dd>
        </div>

        <div>
          <dt>Intentos restantes</dt>
          <dd>{resultado.intentosRestantes ?? '—'}</dd>
        </div>
      </dl>

      <p className="cuestionario-resultado-mensaje">
        {resultado.mensaje}
      </p>

      <div className="cuestionario-resultado-acciones">
        {resultado.puedeSiguiente && siguienteHref && (
          <Link to={siguienteHref} className="primary-button">
            Siguiente lección
            <ArrowRight size={16} />
          </Link>
        )}

        <Link to={temarioHref} className="secondary-button">
          <ArrowLeft size={16} />
          Volver al temario
        </Link>
      </div>
    </article>
  )
}

export default ResultadoCuestionario
