/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'example@example.com',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'Maikel',
        lastName: 'Basso',
        email: 'maikel@gmail.com',
        password: '987654',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'Pablo',
        lastName: 'Romanov',
        email: 'pablo@gmail.com',
        password: 'pablo123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: 'Andre',
        lastName: 'Herera',
        email: 'herera@gmail.com',
        password: 'herera',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {});
  },
};
