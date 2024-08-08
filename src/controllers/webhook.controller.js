const httpStatus = require('http-status');
const { default: Terra } = require('terra-api');
const catchAsync = require('../utils/catchAsync');
const { bodyService, activityService, dailyService } = require('../services');
const config = require('../config/config');

const serviceMap = {
  activity: activityService.handleActivity,
  body: bodyService.handleBody,
  daily: dailyService.handleDaily,
};

const webhook = catchAsync(async (req, res) => {
  const { type } = req.body;

  const terra = new Terra(config.terra.devid, config.terra.apikey, config.terra.secret);
  if (!terra.checkTerraSignature(req.headers['terra-signature'], req.body)) {
    return res.sendStatus(401); // Unauthorized
  }

  const handler = serviceMap[type];
  if (!handler) {
    return res.status(httpStatus.BAD_REQUEST).send('Unknown data type'); // Bad Request
  }

  try {
    await handler(req.body);
    res.status(201).send('Data processed'); // Created
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('Internal Server Error'); // Internal Server Error
  }
});

module.exports = {
  webhook,
};
