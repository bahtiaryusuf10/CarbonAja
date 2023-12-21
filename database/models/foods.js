const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Foods extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.FoodConsumptions, {
        foreignKey: 'foodConsumptionId',
      });
    }
  }

  Foods.init(
    {
      foodConsumptionId: DataTypes.INTEGER,
      ingredient: DataTypes.STRING,
      carbonProduced: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: 'Foods',
      tableName: 'foods',
    },
  );

  return Foods;
};
