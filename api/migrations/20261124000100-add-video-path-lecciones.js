
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            'lecciones',
            'videoPath',
            {
                type: Sequelize.STRING(500),
                allowNull: true
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn(
            'lecciones',
            'videoPath'
        );
    }
};
