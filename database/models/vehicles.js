const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vehicles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Travels, {
        foreignKey: 'vehicleId',
      });
    }
  }

  Vehicles.init(
    {
      vehicleType: DataTypes.STRING,
      brand: DataTypes.STRING,
      carbonEmissionPerKm: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: 'Vehicles',
      tableName: 'vehicles',
    },
  );

  return Vehicles;
};
