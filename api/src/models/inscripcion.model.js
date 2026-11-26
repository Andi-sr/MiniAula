
import SequelizePackage from 'sequelize';
import sequelize from '../config/database.js';

const { DataTypes } = SequelizePackage;

const Inscripcion = sequelize.define(
  'Inscripcion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    fechaInscripcion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'inscripciones',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['usuarioId', 'cursoId'],
        name: 'inscripciones_usuario_curso_unique'
      }
    ]
  }
);

export default Inscripcion;
