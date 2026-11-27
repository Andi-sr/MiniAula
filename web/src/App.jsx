import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import RutaPrivada from './components/RutaPrivada'
import Panel from './components/Panel'
import Perfil from './components/Perfil'
import Profesores from './components/Profesores'

import Login from './pages/login'
import Register from './pages/Register'

import Inicio from './pages/estudiante/Inicio'
import Catalogo from './pages/estudiante/Catalogo'
import CursoDetalle from './pages/estudiante/CursoDetalle'
import MisCursos from './pages/estudiante/MisCursos'
import CursoInscrito from './pages/estudiante/CursoInscrito'
import LeccionAprendizaje from './pages/estudiante/LeccionAprendizaje'
import Cuestionario from './pages/estudiante/Cuestionario'

import InstructorHome from './pages/instructor/InstructorHome'
import MisCursosInstructor from './pages/instructor/MisCursosInstructor'
import CrearCurso from './pages/instructor/CrearCurso'
import EditarCurso from './pages/instructor/EditarCurso'
import LeccionesInstructor from './pages/instructor/LeccionesInstructor'
import CrearLeccion from './pages/instructor/CrearLeccion'
import EditarLeccion from './pages/instructor/EditarLeccion'
import EstadisticasInstructor from './pages/instructor/EstadisticasInstructor'

import './App.css'

function App() {
  const location = useLocation()
  const paginaAuth = ['/login', '/registro'].includes(location.pathname)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      <Route
        path="/"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <Inicio />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/catalogo"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <Catalogo />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/cursos/:id"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <CursoDetalle />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/mis-cursos"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <MisCursos />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/mis-cursos/:id"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <CursoInscrito />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/mis-cursos/:id/lecciones/:leccionId"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <LeccionAprendizaje />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/mis-cursos/:id/lecciones/:leccionId/cuestionario"
        element={
          <RutaPrivada rol="estudiante">
            <Panel>
              <Cuestionario />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/profesores"
        element={
          <RutaPrivada>
            <Panel>
              <Profesores />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/perfil"
        element={
          <RutaPrivada>
            <Panel>
              <Perfil />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <InstructorHome />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor/estadisticas"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <EstadisticasInstructor />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor/cursos"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <MisCursosInstructor />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor/cursos/nuevo"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <CrearCurso />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor/cursos/:id/editar"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <EditarCurso />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor/cursos/:id/lecciones"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <LeccionesInstructor />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor/cursos/:id/lecciones/nueva"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <CrearLeccion />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="/instructor/cursos/:id/lecciones/:leccionId/editar"
        element={
          <RutaPrivada rol="instructor">
            <Panel>
              <EditarLeccion />
            </Panel>
          </RutaPrivada>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={paginaAuth ? location.pathname : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default App
