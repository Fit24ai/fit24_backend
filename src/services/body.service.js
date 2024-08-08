const httpStatus = require('http-status');
const BodyModel = require('../models/body.model');
const ApiError = require('../utils/ApiError');

const handleBody = async (bodyData) => {
  try {
    const newData = new BodyModel(bodyData);
    await newData.save();
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Error saving webhook data');
  }
};
const getBodyData = async (userId, startDate, endDate) => {
  console.log(userId);
  try {
    const pipeline = [
      {
        $match: {
          '_id.user_id': userId,
        },
      },
    ];

    // Optionally add $match stages for startDate and endDate if provided
    if (startDate) {
      pipeline.push({
        $match: {
          'metadata.start_time': { $gte: new Date(startDate) },
        },
      });
    }

    if (endDate) {
      pipeline.push({
        $match: {
          'metadata.end_time': { $lte: new Date(endDate) },
        },
      });
    }

    const result = await BodyModel.aggregate(pipeline);
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting daily data');
  }
};
module.exports = {
  handleBody,
  getBodyData,
};
