const axios = require('axios');
const uploadHelper = require('../helpers/multerHelper');
const { Foods, FoodConsumptions } = require('../../database/models');
const fileHelper = require('../helpers/fileHelper');

const ServiceController = {
  async fetchDataFoodPredict(req, res) {
    try {
      await uploadHelper(req, res);

      const imageFileBuffer = req.file.buffer;

      const blobData = new Blob([imageFileBuffer], { type: req.file.mimetype });
      const formData = new FormData();
      formData.append('file', blobData, req.file.originalname);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const flaskResponse = await axios.post('https://backend-for-ml-grluz5ersa-et.a.run.app/careCarb/food-predict', formData, config);

      const upload = await fileHelper.uploadFile(req.file, 'foods');

      if (upload.status === 'failed') {
        return res.status(400).json({
          status: 'failed',
          message: 'File upload failed',
        });
      }

      const predictions = flaskResponse.data.Predictions;
      const totalCarbonProduced = parseFloat(flaskResponse.data['Total Carbon Produced']);

      const foodConsumptions = await FoodConsumptions.create({
        userId: res.locals.id,
        totalCarbonProduced,
        foodImage: upload.fileUrl,
      });

      const foodData = predictions.map((prediction) => ({
        foodConsumptionId: foodConsumptions.id,
        ingredient: prediction.Ingredients,
        carbonProduced: parseFloat(prediction['Carbon produced']),
      }));

      await Foods.bulkCreate(foodData);

      return res.status(200).json(flaskResponse.data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async fetchDataTransportPredict(req, res) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const flaskResponse = await axios.post('https://backend-for-ml-grluz5ersa-et.a.run.app/careCarb/transport-predict', config);

      // const predictions = flaskResponse.data.Predictions;
      // const totalCarbonProduced = parseFloat(flaskResponse.data['Total Carbon Produced']);

      // const foodConsumptions = await FoodConsumptions.create({
      //   userId: res.locals.id,
      //   totalCarbonProduced,
      //   foodImage: upload.fileUrl,
      // });

      // const foodData = predictions.map((prediction) => ({
      //   foodConsumptionId: foodConsumptions.id,
      //   ingredient: prediction.Ingredients,
      //   carbonProduced: parseFloat(prediction['Carbon produced']),
      // }));

      // await Foods.bulkCreate(foodData);

      return res.status(200).json(flaskResponse.data);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = ServiceController;
