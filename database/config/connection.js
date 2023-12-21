require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME_PRODUCTION,
  process.env.DB_USERNAME_PRODUCTION,
  process.env.DB_PASSWORD_PRODUCTION,
  {
    host: process.env.DB_HOST_PRODUCTION,
    dialect: 'mysql',
    dialectOptions: {
      socketPath: process.env.DB_SOCKET_PATH,
    },
  },
);

module.exports = sequelize;
