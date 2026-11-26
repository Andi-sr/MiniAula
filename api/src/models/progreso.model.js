
import SequelizePackage from 'sequelize';
import sequelize from '../config/database.js';

const { DataTypes } = SequelizePackage;

const Progreso = sequelize.define(
  'Progreso',
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

    leccionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    estado: {
      type: DataTypes.ENUM('pendiente', 'completada'),
      allowNull: false,
      defaultValue: 'pendiente'
    },

    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: true
    },

    fechaFinalizacion: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'progresos',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['usuarioId', 'leccionId'],
        name: 'progresos_usuario_leccion_unique'
      }
    ]
  }
);

export default Progreso;
