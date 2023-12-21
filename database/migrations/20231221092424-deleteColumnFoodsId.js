/** @type {import('sequelize-cli').Migration} */

module.exports = {

  async up(queryInterface) {
    try {
      await queryInterface.removeColumn('FoodConsumptions', 'foodId');

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('FoodConsumptions', 'foodId', {
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

};
