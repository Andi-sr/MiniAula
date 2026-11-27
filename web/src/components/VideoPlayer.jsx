import { Video } from 'lucide-react'

import { useVideoAutorizado } from '../hooks/useVideoAutorizado'
import ErrorMessage from './ErrorMessage'
import './VideoPlayer.css'

function VideoPlayer({ videoPath, titulo = 'Video de la lección', tituloId }) {
  const {
    url,
    cargando,
    error,
    reintentar,
    marcarErrorFormato
  } = useVideoAutorizado(videoPath)

  if (!videoPath) return null

  return (
    <section className="video-reproductor" aria-label={titulo}>
      <div className="video-reproductor-titulo" id={tituloId}>
        <Video size={20} />
        <strong>{titulo}</strong>
      </div>

      {cargando && (
        <div className="video-reproductor-estado">
          <div className="catalogo-cargando"></div>
          <p>Cargando video...</p>
        </div>
      )}

      <ErrorMessage
        {...error}
        onRetry={error?.puedeReintentar ? reintentar : undefined}
      />

      {url && !error && (
        <video
          className="video-reproductor-archivo"
          src={url}
          controls
          onError={marcarErrorFormato}
        />
      )}

      {/\.mov$/i.test(videoPath) && !error && (
        <p className="video-reproductor-aviso">
          Si el archivo es MOV, tu navegador puede no reproducirlo de forma
          nativa.
        </p>
      )}
    </section>
  )
}

export default VideoPlayer
