import Usuario from './usuario.model.js';
import Curso from './curso.model.js';
import Leccion from './leccion.model.js';
import Inscripcion from './inscripcion.model.js';
import Progreso from './progreso.model.js';

// Un instructor puede crear varios cursos.
Usuario.hasMany(Curso, {
  foreignKey: 'instructorId',
  as: 'cursosCreados',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Cada curso pertenece a un instructor.
Curso.belongsTo(Usuario, {
  foreignKey: 'instructorId',
  as: 'instructor',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Un curso contiene varias lecciones.
Curso.hasMany(Leccion, {
  foreignKey: 'cursoId',
  as: 'lecciones',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Cada lección pertenece a un curso.
Leccion.belongsTo(Curso, {
  foreignKey: 'cursoId',
  as: 'curso',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Usuario.hasMany(Inscripcion, {
  foreignKey: 'usuarioId',
  as: 'inscripciones',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Inscripcion.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'estudiante',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Curso.hasMany(Inscripcion, {
  foreignKey: 'cursoId',
  as: 'inscripciones',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Inscripcion.belongsTo(Curso, {
  foreignKey: 'cursoId',
  as: 'curso',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Usuario.hasMany(Progreso, {
  foreignKey: 'usuarioId',
  as: 'progresos',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Progreso.belongsTo(Usuario, {
  foreignKey: 'usuarioId',
  as: 'estudiante',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Curso.hasMany(Progreso, {
  foreignKey: 'cursoId',
  as: 'progresos',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Progreso.belongsTo(Curso, {
  foreignKey: 'cursoId',
  as: 'curso',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Leccion.hasMany(Progreso, {
  foreignKey: 'leccionId',
  as: 'progresos',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Progreso.belongsTo(Leccion, {
  foreignKey: 'leccionId',
  as: 'leccion',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

export {
  Usuario,
  Curso,
  Leccion,
  Inscripcion,
  Progreso
};
