
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('preguntas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      leccionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lecciones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      enunciado: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      opciones: {
        type: Sequelize.JSON,
        allowNull: false
      },

      correcta: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    });

    await queryInterface.addIndex('preguntas', {
      fields: ['leccionId', 'orden'],
      name: 'preguntas_leccion_orden_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('preguntas');
  }
};
