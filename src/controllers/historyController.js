const { FoodConsumptions, Travels } = require('../../database/models');

const historyController = {
  async getAllHistories(req, res) {
    try {
      const { id } = res.locals;
      const foodConsumptions = await FoodConsumptions.findAll({
        where: { userId: id },
        attributes: {
          exclude: ['updatedAt', 'userId', 'foodId'],
        },
      });
      const travels = await Travels.findAll({
        where: { userId: id },
        attributes: {
          exclude: ['updatedAt', 'userId', 'vehicleId'],
        },
      });

      if (!foodConsumptions && !travels) {
        return res.status(404).json({
          status: 'failed',
          message: 'No histories found',
          data: null,
        });
      }

      const history = [...foodConsumptions, ...travels].sort((a, b) => b.createdAt - a.createdAt);

      return res.status(200).json({
        status: 'success',
        message: 'Histories retrieved successfully',
        data: history,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: error.message,
      });
    }
  },
};

module.exports = historyController;
