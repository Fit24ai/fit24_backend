// const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { isValidObjectId } = require('mongoose');
const ApiError = require('./ApiError');

const validateMongodbId = (id) => {
  if (id) {
    const isIDValid = isValidObjectId(id);
    if (!isIDValid) throw new ApiError(httpStatus.NOT_FOUND, 'Invalid Object Id provided');
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide Object Id');
  }
};

const mongooseObjToJsObject = (params) => {
  return params ? params.toObejct() : null;
};
module.exports = { validateMongodbId, mongooseObjToJsObject };
