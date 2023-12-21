/** @type {import('sequelize-cli').Migration} */

module.exports = {

  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Foods', 'foodConsumptionId', {
        type: Sequelize.INTEGER,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        after: 'id',
      });

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeColumn('Foods', 'foodConsumptionsId');

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

};
