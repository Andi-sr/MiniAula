
import bcrypt from 'bcrypt'
import sequelize from '../config/database.js'

import {
  Usuario,
  Curso,
  Leccion
} from '../models/index.js'

const PASSWORD_PRUEBA = 'MiniAula2026!'

const usuariosIniciales = [
  {
    nombre: 'Laura Mendoza',
    email: 'profesor1@miniaula.test',
    rol: 'instructor'
  },
  {
    nombre: 'Carlos Rojas',
    email: 'profesor2@miniaula.test',
    rol: 'instructor'
  },
  {
    nombre: 'Mateo Vargas',
    email: 'estudiante1@miniaula.test',
    rol: 'estudiante'
  },
  {
    nombre: 'Sofia Flores',
    email: 'estudiante2@miniaula.test',
    rol: 'estudiante'
  },
  {
    nombre: 'Daniel Perez',
    email: 'estudiante3@miniaula.test',
    rol: 'estudiante'
  }
]

const cursosIniciales = [
  {
    titulo: 'Matemáticas para primaria',
    descripcion: 'Aprende operaciones básicas, números, sumas, restas, multiplicaciones y divisiones mediante explicaciones sencillas.',
    categoria: 'Matemáticas',
    nivel: 'Primaria',
    instructor: 'profesor1@miniaula.test',
    lecciones: [
      'Conociendo los números',
      'Aprendiendo a sumar',
      'Aprendiendo a restar',
      'Multiplicaciones básicas',
      'Introducción a la división'
    ]
  },
  {
    titulo: 'Ciencias Naturales',
    descripcion: 'Descubre los seres vivos, el cuerpo humano, los animales y el cuidado del medio ambiente.',
    categoria: 'Ciencias Naturales',
    nivel: 'Primaria',
    instructor: 'profesor2@miniaula.test',
    lecciones: [
      'Los seres vivos',
      'El cuerpo humano',
      'Los animales',
      'Las plantas',
      'Cuidemos el medio ambiente'
    ]
  },
  {
    titulo: 'Lenguaje y Comunicación',
    descripcion: 'Desarrolla tus habilidades de lectura, escritura, comprensión lectora y comunicación.',
    categoria: 'Lenguaje',
    nivel: 'Primaria',
    instructor: 'profesor1@miniaula.test',
    lecciones: [
      'El abecedario',
      'Formación de palabras',
      'Construcción de oraciones',
      'Comprensión lectora',
      'Aprendiendo a escribir'
    ]
  }
]

async function ejecutarDatosIniciales() {
  try {
    await sequelize.authenticate()
    console.log('Conexión con la base de datos establecida.')

    const passwordHash = await bcrypt.hash(PASSWORD_PRUEBA, 12)

    const usuarios = {}

    for (const datos of usuariosIniciales) {
      const [usuario, creado] = await Usuario.findOrCreate({
        where: { email: datos.email },
        defaults: {
          ...datos,
          passwordHash
        }
      })

      usuarios[datos.email] = usuario

      console.log(
        `${creado ? 'Creado' : 'Ya existía'} usuario: ${usuario.email}`
      )
    }

    for (const datosCurso of cursosIniciales) {
      const instructor = usuarios[datosCurso.instructor]

      const [curso, creado] = await Curso.findOrCreate({
        where: { titulo: datosCurso.titulo },
        defaults: {
          titulo: datosCurso.titulo,
          descripcion: datosCurso.descripcion,
          categoria: datosCurso.categoria,
          nivel: datosCurso.nivel,
          estado: 'publicado',
          instructorId: instructor.id
        }
      })

      console.log(
        `${creado ? 'Creado' : 'Ya existía'} curso: ${curso.titulo}`
      )

      for (let i = 0; i < datosCurso.lecciones.length; i++) {
        const titulo = datosCurso.lecciones[i]

        const [leccion, creada] = await Leccion.findOrCreate({
          where: {
            cursoId: curso.id,
            orden: i + 1
          },
          defaults: {
            titulo,
            tipo: 'contenido',
            contenido: `En esta lección aprenderás sobre ${titulo.toLowerCase()}. Lee atentamente la explicación y repasa los conceptos principales.`,
            orden: i + 1,
            cursoId: curso.id
          }
        })

        console.log(
          `  ${creada ? 'Creada' : 'Ya existía'} lección: ${leccion.titulo}`
        )
      }
    }

    console.log('\nDatos iniciales procesados correctamente.')
  } catch (error) {
    console.error('Error al crear los datos iniciales:', error)
    process.exitCode = 1
  } finally {
    await sequelize.close()
  }
}

ejecutarDatosIniciales()
