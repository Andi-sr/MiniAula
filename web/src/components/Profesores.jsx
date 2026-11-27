import { Users } from 'lucide-react'

function Profesores() {
  return (
    <section className="page-section">
      <div className="page-heading">
        <h1>Profesores</h1>
        <p>Conoce a los instructores de MiniAula.</p>
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          <Users size={35} />
        </div>

        <h3>Profesores</h3>
        <p>
          Próximamente podrás consultar la información de los instructores.
        </p>
      </div>
    </section>
  )
}

export default Profesores
