/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Foods', 'carbonProduced', {
        type: Sequelize.STRING,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        after: 'ingredient',
      });

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeColumn('Foods', 'carbonProduced');

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
