
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('progresos', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            usuarioId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'usuarios',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
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
            estado: {
                type: Sequelize.ENUM('pendiente', 'completada'),
                allowNull: false,
                defaultValue: 'pendiente'
            },
            fechaInicio: {
                type: Sequelize.DATE,
                allowNull: true
            },
            fechaFinalizacion: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        await queryInterface.addConstraint('progresos', {
            fields: ['usuarioId', 'leccionId'],
            type: 'unique',
            name: 'progresos_usuario_leccion_unique'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('progresos');
    }
};
