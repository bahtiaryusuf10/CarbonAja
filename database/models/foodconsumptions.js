const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FoodConsumptions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Users, {
        foreignKey: 'userId',
      });
      this.hasMany(models.Foods, {
        foreignKey: 'foodConsumptionId',
      });
    }
  }

  FoodConsumptions.init(
    {
      userId: DataTypes.INTEGER,
      totalCarbonProduced: DataTypes.DOUBLE,
      foodImage: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'FoodConsumptions',
      tableName: 'foodconsumptions',
    },
  );

  return FoodConsumptions;
};
