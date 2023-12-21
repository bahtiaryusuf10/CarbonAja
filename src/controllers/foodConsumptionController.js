const { Op } = require('sequelize');
const { Foods, FoodConsumptions } = require('../../database/models');
const fileHelper = require('../helpers/fileHelper');

const FoodConsumptionController = {
  async getCarbonConsumptionPerDay(req, res) {
    try {
      const { date } = req.params;

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const userId = res.locals.id;
      const totalCarbon = await FoodConsumptions.sum('totalCarbonProduced', {
        where: {
          userId,
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      return res.status(200).json({
        status: 'success',
        message: 'Total carbon consumption retrieved successfully',
        data: {
          userId,
          date,
          totalCarbonConsumed: totalCarbon || 0,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },

  async getFoodConsumptionDetail(req, res) {
    try {
      const { id } = req.params;
      const foodConsumption = await FoodConsumptions.findOne({
        where: { id },
        include: [
          {
            model: Foods,
            as: 'Foods',
            attributes: {
              exclude: ['createdAt', 'updatedAt'],
            },
          },
        ],
        attributes: {
          exclude: ['updatedAt'],
        },
      });

      if (!foodConsumption) {
        return res.status(404).json({
          status: 'failed',
          message: 'Food consumption not found',
          data: null,
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Food consumption retrieved successfully',
        data: foodConsumption,
        completing_text: 'eating low-carbon foods.',
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },

  async deleteFoodConsumption(req, res) {
    try {
      const { id } = req.params;
      const foodConsumption = await FoodConsumptions.findByPk(id);

      if (!foodConsumption) {
        return res.status(404).json({
          status: 'failed',
          message: 'Food consumption not found',
          data: null,
        });
      }

      const imageUrl = foodConsumption.foodImage;
      if (imageUrl) {
        const deleteResult = await fileHelper.deleteFile(imageUrl);
        if (deleteResult.status === 'failed') {
          return {
            status: 'failed',
            message: 'Failed to delete food image file in bucket',
          };
        }
      }

      await Foods.destroy({
        where: { foodConsumptionId: id },
      });

      await foodConsumption.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Food consumption deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },
};

module.exports = FoodConsumptionController;
