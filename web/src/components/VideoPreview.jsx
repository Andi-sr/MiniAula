import VideoPlayer from './VideoPlayer'

function VideoPreview({ videoPath, onCerrar }) {
  return (
    <div className="instructor-modal-overlay" onClick={onCerrar}>
      <section
        className="instructor-modal instructor-video-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-video"
        onClick={(evento) => evento.stopPropagation()}
      >
        <VideoPlayer
          videoPath={videoPath}
          titulo="Vista previa del video"
          tituloId="titulo-video"
        />

        <div className="instructor-modal-acciones">
          <button
            type="button"
            className="secondary-button"
            onClick={onCerrar}
          >
            Cerrar
          </button>
        </div>
      </section>
    </div>
  )
}

export default VideoPreview
