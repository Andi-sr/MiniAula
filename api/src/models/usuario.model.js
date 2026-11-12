
import SequelizePackage from 'sequelize';
import sequelize from '../config/database.js';

const { DataTypes } = SequelizePackage;

const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    email: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    rol: {
      type: DataTypes.ENUM(
        'estudiante',
        'instructor'
      ),
      allowNull: false
    },

    creadoEn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'usuarios',
    timestamps: false
  }
);

export default Usuario;
