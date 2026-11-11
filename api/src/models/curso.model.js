
import SequelizePackage from 'sequelize';
import sequelize from '../config/database.js';

const { DataTypes } = SequelizePackage;

const Curso = sequelize.define(
  'Curso',
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

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    categoria: {
      type: DataTypes.STRING(70),
      allowNull: false
    },

    nivel: {
      type: DataTypes.STRING(50),
      allowNull: false
    },

    estado: {
      type: DataTypes.ENUM(
        'borrador',
        'publicado',
        'archivado'
      ),
      allowNull: false,
      defaultValue: 'borrador'
    },

    instructorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    creadoEn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'cursos',
    timestamps: false
  }
);

export default Curso;
