
import SequelizePackage from 'sequelize';
import sequelize from '../config/database.js';

const { DataTypes } = SequelizePackage;

const Pregunta = sequelize.define(
  'Pregunta',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    leccionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    enunciado: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    opciones: {
      type: DataTypes.JSON,
      allowNull: false
    },

    correcta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    tableName: 'preguntas',
    timestamps: false,
    indexes: [
      {
        fields: ['leccionId', 'orden']
      }
    ]
  }
);

export default Pregunta;
