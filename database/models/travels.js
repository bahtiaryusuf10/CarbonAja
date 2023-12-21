const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Travels extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Users, {
        foreignKey: 'userId',
      });
      this.belongsTo(models.Vehicles, {
        foreignKey: 'vehicleId',
      });
    }
  }

  Travels.init(
    {
      userId: DataTypes.INTEGER,
      vehicleId: DataTypes.INTEGER,
      distanceTravelled: DataTypes.DOUBLE,
      carbonProduced: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: 'Travels',
      tableName: 'travels',
    },
  );

  return Travels;
};
