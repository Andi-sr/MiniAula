import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  BookMarked,
  GraduationCap,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

import ErrorMessage from '../../components/ErrorMessage'

function FormularioCurso({
  curso,
  onSubmit,
  guardando,
  errorInfo,
  onLimpiarError,
  textoBoton
}) {
  const navigate = useNavigate()
  const enviandoRef = useRef(false)

  const [formulario, setFormulario] = useState({
    titulo: curso?.titulo || '',
    descripcion: curso?.descripcion || '',
    categoria: curso?.categoria || '',
    nivel: curso?.nivel || ''
  })
  const [errores, setErrores] = useState({})

  const actualizarCampo = (campo, valor) => {
    setFormulario({ ...formulario, [campo]: valor })
    setErrores({ ...errores, [campo]: '' })
    onLimpiarError?.()
  }

  const validar = () => {
    const nuevosErrores = {}
    const titulo = formulario.titulo.trim()
    const descripcion = formulario.descripcion.trim()
    const categoria = formulario.categoria.trim()
    const nivel = formulario.nivel.trim()

    if (titulo.length < 3 || titulo.length > 150) {
      nuevosErrores.titulo = 'El título debe tener entre 3 y 150 caracteres.'
    }

    if (descripcion.length < 10 || descripcion.length > 2000) {
      nuevosErrores.descripcion =
        'La descripción debe tener entre 10 y 2000 caracteres.'
    }

    if (categoria.length < 2 || categoria.length > 100) {
      nuevosErrores.categoria =
        'La categoría debe tener entre 2 y 100 caracteres.'
    }

    if (nivel.length < 2 || nivel.length > 50) {
      nuevosErrores.nivel = 'El nivel debe tener entre 2 y 50 caracteres.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault()

    if (enviandoRef.current || guardando || !validar()) return

    enviandoRef.current = true

    try {
      await onSubmit({
        titulo: formulario.titulo.trim(),
        descripcion: formulario.descripcion.trim(),
        categoria: formulario.categoria.trim(),
        nivel: formulario.nivel.trim()
      })
    } finally {
      enviandoRef.current = false
    }
  }

  return (
    <form className="auth-form" onSubmit={manejarEnvio}>
      <ErrorMessage {...errorInfo} />

      <label htmlFor="curso-titulo">Título</label>
      <div className="auth-input">
        <BookOpen size={19} />
        <input
          id="curso-titulo"
          name="titulo"
          type="text"
          minLength={3}
          maxLength={150}
          required
          placeholder="Nombre del curso"
          value={formulario.titulo}
          onChange={(evento) => actualizarCampo('titulo', evento.target.value)}
        />
      </div>
      {errores.titulo && <p className="auth-error">{errores.titulo}</p>}

      <label htmlFor="curso-descripcion">Descripción</label>
      <textarea
        id="curso-descripcion"
        name="descripcion"
        className="auth-textarea"
        minLength={10}
        maxLength={2000}
        required
        placeholder="Describe lo que aprenderán tus estudiantes"
        value={formulario.descripcion}
        onChange={(evento) =>
          actualizarCampo('descripcion', evento.target.value)
        }
      />
      {errores.descripcion && (
        <p className="auth-error">{errores.descripcion}</p>
      )}

      <label htmlFor="curso-categoria">Categoría</label>
      <div className="auth-input">
        <BookMarked size={19} />
        <input
          id="curso-categoria"
          name="categoria"
          type="text"
          minLength={2}
          maxLength={100}
          required
          placeholder="Ej. Matemáticas"
          value={formulario.categoria}
          onChange={(evento) =>
            actualizarCampo('categoria', evento.target.value)
          }
        />
      </div>
      {errores.categoria && <p className="auth-error">{errores.categoria}</p>}

      <label htmlFor="curso-nivel">Nivel</label>
      <div className="auth-input">
        <GraduationCap size={19} />
        <input
          id="curso-nivel"
          name="nivel"
          type="text"
          minLength={2}
          maxLength={50}
          required
          placeholder="Ej. Primaria"
          value={formulario.nivel}
          onChange={(evento) => actualizarCampo('nivel', evento.target.value)}
        />
      </div>
      {errores.nivel && <p className="auth-error">{errores.nivel}</p>}

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
          onClick={() => navigate('/instructor/cursos')}
        >
          Cancelar
        </button>
      </div>

      {!curso && (
        <span className="instructor-ayuda">
          <CheckCircle size={13} /> El curso se creará en estado borrador.
        </span>
      )}
    </form>
  )
}

export default FormularioCurso
