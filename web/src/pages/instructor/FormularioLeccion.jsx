import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  BookMarked,
  Video,
  Eye,
  ArrowRight
} from 'lucide-react'

import ErrorMessage from '../../components/ErrorMessage'
import VideoPreview from '../../components/VideoPreview'
import './Instructor.css'
import './FormularioLeccion.css'

const EXTENSIONES_VIDEO = ['mp4', 'webm', 'mov']
const LIMITE_VIDEO_BYTES = 100 * 1024 * 1024

function FormularioLeccion({
  cursoId,
  leccion,
  onSubmit,
  guardando,
  errorInfo,
  onLimpiarError,
  textoBoton
}) {
  const navigate = useNavigate()
  const enviandoRef = useRef(false)
  const inputVideoRef = useRef(null)

  const [formulario, setFormulario] = useState({
    titulo: leccion?.titulo || '',
    contenido: leccion?.contenido || ''
  })
  const [archivoVideo, setArchivoVideo] = useState(null)
  const [quitarVideo, setQuitarVideo] = useState(false)
  const [errores, setErrores] = useState({})
  const [viendoVideo, setViendoVideo] = useState(false)

  const actualizarCampo = (campo, valor) => {
    setFormulario({ ...formulario, [campo]: valor })
    setErrores({ ...errores, [campo]: '' })
    onLimpiarError?.()
  }

  const seleccionarVideo = (evento) => {
    const archivo = evento.target.files?.[0] || null

    setArchivoVideo(archivo)
    setQuitarVideo(false)
    setErrores({ ...errores, video: '' })
    onLimpiarError?.()
  }

  const quitarArchivo = () => {
    setArchivoVideo(null)
    setErrores({ ...errores, video: '' })
    onLimpiarError?.()

    if (inputVideoRef.current) {
      inputVideoRef.current.value = ''
    }
  }

  const validarVideo = () => {
    if (!archivoVideo) return ''

    if (archivoVideo.size === 0) {
      return 'El archivo seleccionado está vacío.'
    }

    const extension = archivoVideo.name.split('.').pop()?.toLowerCase()

    if (!EXTENSIONES_VIDEO.includes(extension)) {
      return 'Solo se permiten videos MP4, WebM o MOV.'
    }

    if (archivoVideo.size > LIMITE_VIDEO_BYTES) {
      return 'El video supera el límite de 100 MB.'
    }

    return ''
  }

  const validar = () => {
    const nuevosErrores = {}
    const titulo = formulario.titulo.trim()
    const contenido = formulario.contenido.trim()

    if (titulo.length < 3 || titulo.length > 150) {
      nuevosErrores.titulo = 'El título debe tener entre 3 y 150 caracteres.'
    }

    if (contenido.length < 1) {
      nuevosErrores.contenido = 'El contenido es obligatorio.'
    }

    const errorVideo = validarVideo()

    if (errorVideo) {
      nuevosErrores.video = errorVideo
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()

    if (enviandoRef.current || guardando || !validar()) return

    enviandoRef.current = true

    try {
      await onSubmit(
        {
          titulo: formulario.titulo.trim(),
          contenido: formulario.contenido.trim()
        },
        {
          archivoVideo,
          quitarVideo
        }
      )
    } finally {
      enviandoRef.current = false
    }
  }

  return (
    <form className="auth-form" onSubmit={manejarEnvio}>
      <ErrorMessage {...errorInfo} />

      <label htmlFor="leccion-titulo">Título</label>
      <div className="auth-input">
        <BookOpen size={19} />
        <input
          id="leccion-titulo"
          name="titulo"
          type="text"
          minLength={3}
          maxLength={150}
          required
          placeholder="Título de la lección"
          value={formulario.titulo}
          onChange={(evento) => actualizarCampo('titulo', evento.target.value)}
        />
      </div>
      {errores.titulo && <p className="auth-error">{errores.titulo}</p>}

      <label htmlFor="leccion-contenido">Contenido</label>
      <textarea
        id="leccion-contenido"
        name="contenido"
        className="auth-textarea"
        required
        placeholder="Escribe aquí el contenido de la lección"
        value={formulario.contenido}
        onChange={(evento) =>
          actualizarCampo('contenido', evento.target.value)
        }
      />
      {errores.contenido && (
        <p className="auth-error">{errores.contenido}</p>
      )}

      {leccion?.videoPath && (
        <>
          <div className="instructor-video-actual">
            <span>Esta lección ya tiene un video guardado.</span>

            <button
              type="button"
              className="instructor-boton"
              onClick={() => setViendoVideo(true)}
            >
              <Eye size={14} />
              Ver video
            </button>
          </div>

          <label className="instructor-checkbox">
            <input
              type="checkbox"
              checked={quitarVideo}
              disabled={Boolean(archivoVideo) || guardando}
              onChange={(evento) => {
                setQuitarVideo(evento.target.checked)
                onLimpiarError?.()
              }}
            />
            Quitar el video actual
          </label>
        </>
      )}

      <label htmlFor="leccion-video">Video (opcional)</label>
      <div className="auth-input instructor-archivo">
        <Video size={19} />
        <input
          ref={inputVideoRef}
          id="leccion-video"
          name="video"
          type="file"
          accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
          disabled={guardando || quitarVideo}
          onChange={seleccionarVideo}
        />
      </div>
      <span className="instructor-ayuda">
        <BookMarked size={13} /> MP4, WebM o MOV. Tamaño máximo: 100 MB.
      </span>
      {errores.video && <p className="auth-error">{errores.video}</p>}

      {archivoVideo && (
        <div className="instructor-video-actual">
          <span className="instructor-nombre-archivo">
            Archivo seleccionado: {archivoVideo.name}
          </span>

          <button
            type="button"
            className="instructor-boton"
            onClick={quitarArchivo}
            disabled={guardando}
          >
            Quitar
          </button>
        </div>
      )}

      <div className="instructor-form-acciones">
        <button
          type="submit"
          className="auth-submit"
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : textoBoton}
          {!guardando && <ArrowRight size={18} />}
        </button>

        <button
          type="button"
          className="secondary-button"
          disabled={guardando}
          onClick={() => navigate(`/instructor/cursos/${cursoId}/lecciones`)}
        >
          Cancelar
        </button>
      </div>

      {viendoVideo && leccion?.videoPath && (
        <VideoPreview
          key={leccion.videoPath}
          videoPath={leccion.videoPath}
          onCerrar={() => setViendoVideo(false)}
        />
      )}
    </form>
  )
}

export default FormularioLeccion
