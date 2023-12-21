/** @type {import('sequelize-cli').Migration} */

module.exports = {

  async up(queryInterface) {
    await queryInterface.renameColumn('FoodConsumptions', 'carbonProduced', 'totalCarbonProduced');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('FoodConsumptions', 'totalCarbonProduced', 'carbonProduced');
  },

};
