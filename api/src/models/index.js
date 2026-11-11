import Usuario from './usuario.model.js';
import Curso from './curso.model.js';
import Leccion from './leccion.model.js';

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

export {
  Usuario,
  Curso,
  Leccion
};
