const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Travels, {
        foreignKey: 'userId',
      });
      this.hasMany(models.FoodConsumptions, {
        foreignKey: 'userId',
      });
    }
  }

  Users.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      profilePicture: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      accessToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Users',
      tableName: 'users',
    },
  );

  return Users;
};
