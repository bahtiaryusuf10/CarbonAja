/** @type {import('sequelize-cli').Migration} */

module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Foods', 'foodImage');

    await queryInterface.addColumn('FoodConsumptions', 'foodImage', {
      type: Sequelize.STRING,
      after: 'totalCarbonProduced',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Foods', 'foodImage', {
      type: Sequelize.STRING,
      after: 'carbonProduced',
    });

    await queryInterface.removeColumn('FoodConsumptions', 'foodImage');
  },

};
