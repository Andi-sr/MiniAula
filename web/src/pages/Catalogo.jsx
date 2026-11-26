
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'

import useCursos from '../hooks/useCursos'
import './Catalogo.css'

function Catalogo() {
  const {
    cursos,
    total,
    pagina,
    totalPaginas,
    cargando,
    error,
    buscarCursos,
    cambiarPagina,
    recargar
  } = useCursos()

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  const manejarBusqueda = (e) => {
    e.preventDefault()
    buscarCursos(busqueda, categoria)
  }

  return (
    <section className="catalogo-page">

      <div className="catalogo-encabezado">
        <div>
          <span className="catalogo-etiqueta">
            <GraduationCap size={16} />
            Aprende a tu ritmo
          </span>

          <h1>Explora nuestras clases</h1>

          <p>
            Encuentra cursos interesantes y descubre nuevos conocimientos.
          </p>
        </div>
      </div>

      <form className="catalogo-filtros" onSubmit={manejarBusqueda}>

        <div className="catalogo-campo busqueda-campo">
          <Search size={19} />

          <input
            type="text"
            placeholder="Buscar un curso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="catalogo-campo categoria-campo">
          <Filter size={19} />

          <input
            type="text"
            placeholder="Filtrar por categoría..."
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>

        <button type="submit" className="catalogo-boton">
          Buscar
        </button>
      </form>

      <div className="catalogo-resultados">
        <div>
          <h2>Todos los cursos</h2>

          <p>
            {total} {total === 1 ? 'curso disponible' : 'cursos disponibles'}
          </p>
        </div>
      </div>

      {cargando ? (

        <div className="catalogo-estado">
          <div className="catalogo-cargando"></div>
          <p>Cargando cursos...</p>
        </div>

      ) : error ? (

        <div className="catalogo-estado catalogo-error">
          <BookOpen size={35} />
          <h3>No se pudieron cargar los cursos</h3>
          <p>{error}</p>

          <button
            type="button"
            className="catalogo-boton"
            onClick={recargar}
          >
            Intentar nuevamente
          </button>
        </div>

      ) : cursos.length === 0 ? (

        <div className="catalogo-estado">
          <BookOpen size={40} />
          <h3>No encontramos cursos</h3>
          <p>Prueba con otro nombre o categoría.</p>
        </div>

      ) : (

        <>
          <div className="catalogo-grid">

            {cursos.map((curso) => (
              <article className="curso-card" key={curso.id}>

                <div className="curso-card-imagen">
                  <BookOpen size={38} />
                </div>

                <div className="curso-card-contenido">

                  <span className="curso-categoria">
                    {curso.categoria || 'General'}
                  </span>

                  <h3>{curso.titulo}</h3>

                  <p className="curso-descripcion">
                    {curso.descripcion ||
                      'Descubre todo lo que aprenderás en este curso.'}
                  </p>

                  <div className="curso-card-pie">

                    <span className="curso-nivel">
                      {curso.nivel || 'Nivel general'}
                    </span>

                    <Link
                      to={`/cursos/${curso.id}`}
                      className="curso-ver-detalle"
                    >
                      Ver curso
                    </Link>

                  </div>
                </div>
              </article>
            ))}

          </div>

          {totalPaginas > 1 && (
            <div className="catalogo-paginacion">

              <button
                type="button"
                onClick={() => cambiarPagina(pagina - 1)}
                disabled={pagina === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={19} />
              </button>

              <span>
                Página {pagina} de {totalPaginas}
              </span>

              <button
                type="button"
                onClick={() => cambiarPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                aria-label="Página siguiente"
              >
                <ChevronRight size={19} />
              </button>

            </div>
          )}
        </>

      )}

    </section>
  )
}

export default Catalogo
