
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('inscripciones', {
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
                onDelete: 'RESTRICT'
            },
            fechaInscripcion: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        await queryInterface.addConstraint('inscripciones', {
            fields: ['usuarioId', 'cursoId'],
            type: 'unique',
            name: 'inscripciones_usuario_curso_unique'
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('inscripciones');
    }
};
