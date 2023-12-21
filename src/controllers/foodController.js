const { Foods } = require('../../database/models');
const uploadHelper = require('../helpers/multerHelper');
const fileHelper = require('../helpers/fileHelper');

const FoodController = {
  async addFood(req, res) {
    try {
      const { ingredient } = req.body;
      await uploadHelper(req, res);

      if (!req.file) {
        return res.status(400).json({
          status: 'failed',
          message: 'Please upload an image',
        });
      }

      const upload = await fileHelper.uploadFile(req.file, 'foods');

      if (upload.status === 'failed') {
        return res.status(400).json({
          status: 'failed',
          message: 'File upload failed',
        });
      }

      const food = await Foods.create({
        ingredient: JSON.stringify(ingredient),
        foodImage: upload.fileUrl,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Food added successfully',
        data: food,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: error.message,
      });
    }
  },

  // async getFoodDetail(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const food = await Foods.findByPk({ id });

  //     if (!food) {
  //       return res.status(404).json({
  //         status: 'failed',
  //         message: 'Food not found',
  //         data: null,
  //       });
  //     }

  //     return res.status(200).json({
  //       status: 'success',
  //       data: food,
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       status: 'failed',
  //       message: `Internal server error: ${error.message}`,
  //     });
  //   }
  // },

  async deleteFood(req, res) {
    try {
      const { id } = req.params;
      const food = await Foods.findByPk(id);

      if (!food) {
        return res.status(404).json({
          status: 'failed',
          message: 'Food not found',
          data: null,
        });
      }

      const imageUrl = food.foodImage;
      if (imageUrl) {
        const deleteResult = await fileHelper.deleteFile(imageUrl);
        if (deleteResult.status === 'failed') {
          return {
            status: 'failed',
            message: 'Failed to delete food image file in bucket',
          };
        }
      }

      await Foods.destroy();

      return res.status(200).json({
        status: 'success',
        message: 'Food deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        status: 'failed',
        message: `Internal server error: ${error.message}`,
      });
    }
  },
};

module.exports = FoodController;
