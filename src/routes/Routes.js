const express = require('express');
const multer = require('multer');

const reqFormData = multer().none();

const router = express.Router();
const userController = require('../controllers/userController');
const vehicleController = require('../controllers/vehicleController');
const foodConsumptionController = require('../controllers/foodConsumptionController');
const travelController = require('../controllers/travelController');
const historyController = require('../controllers/historyController');
const handleRefreshToken = require('../controllers/refreshTokenController');
const serviceController = require('../controllers/serviceController');
const userAuthentication = require('../middleware/userAuthentication');

// Routes for user data
router.post('/users/register', reqFormData, userController.registerUser);
router.post('/users/login', reqFormData, userController.loginUser);
router.get('/users', userAuthentication, userController.getAllUsers);
router.get('/users/detail', userAuthentication, userController.getUserDetail);
router.get('/users/refresh-token', handleRefreshToken);
router.get('/users/logout', userController.logoutUser);
router.put('/users/update', userAuthentication, userController.updateUser);
router.put('/users/change-password', reqFormData, userAuthentication, userController.changePassword);
router.delete('/users/delete/:id', userAuthentication, userController.deleteUser);

// Routes for food data
router.get('/food-consumptions/total/:date', userAuthentication, foodConsumptionController.getCarbonConsumptionPerDay);
router.get('/food-consumptions/detail/:id', userAuthentication, foodConsumptionController.getFoodConsumptionDetail);
router.delete('/food-consumptions/delete/:id', userAuthentication, foodConsumptionController.deleteFoodConsumption);

// Routes for vehicle data
router.post('/vehicles/add', reqFormData, userAuthentication, vehicleController.addVehicle);
router.delete('/vehicles/:id', userAuthentication, vehicleController.deleteVehicle);

// Routes for travel data
router.post('/travels/add', reqFormData, userAuthentication, travelController.addTravel);
router.get('/travels/:id', userAuthentication, travelController.getTravelDetail);
router.delete('/travels/:id', userAuthentication, travelController.deleteTravel);

// Routes for history data
router.get('/histories', userAuthentication, historyController.getAllHistories);

// Routes for services data
router.post('/services/food-predict', userAuthentication, serviceController.fetchDataFoodPredict);
router.post('/services/transport-predict', userAuthentication, serviceController.fetchDataTransportPredict);

module.exports = router;
