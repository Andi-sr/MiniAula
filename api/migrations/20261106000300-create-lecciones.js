
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lecciones', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      titulo: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM(
          'contenido',
          'cuestionario'
        ),
        allowNull: false
      },
      contenido: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      videoUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      notaMinima: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cursoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cursos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lecciones');
  }
};
