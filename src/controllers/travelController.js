const { Vehicles, Travels } = require('../../database/models');

const TravelController = {
  async addTravel(req, res) {
    try {
      const { carbonProduced, distanceTravelled, vehicleId } = req.body;
      const travel = await Travels.create({
        userId: res.locals.id,
        vehicleId,
        distanceTravelled,
        carbonProduced,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Travel added successfully',
        data: travel,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: error.message,
      });
    }
  },

  async getTravelDetail(req, res) {
    try {
      const { id } = req.params;
      const travel = await Travels.findOne({
        where: { id },
        include: [
          {
            model: Vehicles,
            as: 'vehicle',
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ],
        attributes: {
          exclude: ['updatedAt', 'vehicleId'],
        },
      });

      if (!travel) {
        return res.status(404).json({
          status: 'failed',
          message: 'Travel not found',
          data: null,
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Travel retrieved successfully',
        data: travel,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: error.message,
      });
    }
  },

  async deleteTravel(req, res) {
    try {
      const { id } = req.params;
      const travel = await Travels.destroy({
        where: { id },
      });

      if (!travel) {
        return res.status(404).json({
          status: 'failed',
          message: 'Travel not found',
          data: null,
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Travel deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },
};

module.exports = TravelController;
