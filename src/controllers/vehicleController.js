const { Vehicles } = require('../../database/models');

const VehicleController = {
  async addVehicle(req, res) {
    try {
      const { brand, carbonEmissionPerKm, vehicleType } = req.body;
      const vehicle = await Vehicles.create({
        vehicleType,
        brand,
        carbonEmissionPerKm,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Vehicle added successfully',
        data: vehicle,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: error.message,
      });
    }
  },

  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await Vehicles.findByPk(id);

      if (!vehicle) {
        return res.status(404).json({
          status: 'failed',
          message: 'Vehicle not found',
          data: null,
        });
      }

      await Vehicles.destroy({
        where: { id },
      });

      return res.status(200).json({
        status: 'success',
        message: 'Vehicle deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },
};

module.exports = VehicleController;
