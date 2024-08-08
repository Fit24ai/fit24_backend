/* eslint-disable prettier/prettier */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { bodyService, activityService, dailyService } = require('../services');


const serviceMap = {
  activity: activityService.getActivityData,
  body: bodyService.getBodyData,
  distance: dailyService.getStepsData,
  dailywebhook: dailyService.updateDailyWebhook,
  dailyupdate: dailyService.updateDailyData,
  monthly: dailyService.getStepsMonthly,
  weekly: dailyService.getStepsWeekly,
  daily: dailyService.getStepsDaily,
  
};
const getData = catchAsync(async (req, res) => {
  const { userId, type } = req.params;
  const { startDate, endDate } = req.query;
  console.log(startDate, endDate);
  const handler = serviceMap[type];
  if (!handler) {
    return res.status(httpStatus.BAD_REQUEST).send('Unknown data type'); // Bad Request
  }
  try {
    const result = await handler(userId,startDate, endDate);
      
      if(type==='dailywebhook'){
        return res.status(200).json(result);
      }
      if (result && result.length > 0) {
        return res.status(200).json({
          status: 'success',
          message: `${type} data retrieved successfully`,
          data: result,
        });
      } 
      return res.status(404).json({
        status: 'fail',
        message: `${type} data not found`,
      });
    
    } catch (error) {
      
      return res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
      });
    }
});

const getStepsData = catchAsync(async (req, res) => {
  const { type } = req.params;
  const { startDate, action } = req.query;
  const handler = serviceMap[type];
  const token = req.headers.authorization;
  console.log(token, 'token');
  if (!handler) {
    return res.status(httpStatus.BAD_REQUEST).send('Unknown data type'); 
  }
  const reqData = {
    userId: req.user._id.toString(),
    startDate,
    action,
  }
  try {
    const result = await handler(reqData);
      
      if (result && result.length > 0) {
        return res.status(200).json({
          status: 'success',
          message: `${type} data retrieved successfully`,
          data: result,
        });
      } 
      return res.status(404).json({
        status: 'fail',
        message: `${type} data not found`,
      });
    
    } catch (error) {
      
      return res.status(error.statusCode).json({
        status: error.statusCode,
        message: error.message,
      });
    }
});

const dailyUpdate = catchAsync(async (req, res) => {
  const handler = serviceMap.dailyupdate;
  if (!handler) {
    return res.status(httpStatus.BAD_REQUEST).send('Unknown data type'); // Bad Request
  }

  try {
    const result = await handler(req.body,req.user._id);
    
    res.status(201).send({
      status: 'success',
      message: `Updated successfully`,
      data: result,
    }); // Created
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('Internal Server Error'); // Internal Server Error
  }
});
module.exports = {
  getData,
  dailyUpdate,
  getStepsData
};
