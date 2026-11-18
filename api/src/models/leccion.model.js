
import SequelizePackage from 'sequelize';
import sequelize from '../config/database.js';

const { DataTypes } = SequelizePackage;

const Leccion = sequelize.define(
  'Leccion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    tipo: {
      type: DataTypes.ENUM(
        'contenido',
        'cuestionario'
      ),
      allowNull: false
    },

    contenido: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },

    orden: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    notaMinima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },

    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'lecciones',
    timestamps: false
  }
);

export default Leccion;
