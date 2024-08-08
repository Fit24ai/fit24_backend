const Joi = require('joi');
const { password } = require('./custom.validation');
const { GOALS, LEVELS } = require('../utils/constant');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
  }),
};

const registerRequest = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    // firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().trim().lowercase().email().required(),
    mobileNumber: Joi.string().optional(),
    password: Joi.string().required(),
    // password: Joi.string().required(),
    gender: Joi.string().valid('male', 'female', 'other'),
    role: Joi.string().valid('admin', 'user', 'guest').default('user'), // Adjust as per roles
    city: Joi.string().optional(),
    pincode: Joi.string().optional(),
    isActive: Joi.boolean().default(true),
    dob: Joi.string().optional(),
    age: Joi.number().optional(),
    selectedDate: Joi.string().optional(),
    height: Joi.number().optional(),
    weight: Joi.number().optional(),
    country: Joi.string().optional(),
    address: Joi.string().optional(),
    goal: Joi.string()
      .optional()
      .valid(...GOALS),
    level: Joi.string()
      .optional()
      .valid(...LEVELS),
  }),
};

const updateRequest = {
  body: Joi.object().keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    mobileNumber: Joi.string().optional(),
    gender: Joi.string().valid('male', 'female', 'other'),
    city: Joi.string().optional(),
    pincode: Joi.string().optional(),
    dob: Joi.string().optional(),
    age: Joi.number().optional(),
    selectedDate: Joi.string().optional(),
    height: Joi.number().optional(),
    weight: Joi.number().optional(),
    country: Joi.string().optional(),
    address: Joi.string().optional(),
    goal: Joi.string()
      .optional()
      .valid(...GOALS),
    level: Joi.string()
      .optional()
      .valid(...LEVELS),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().trim().lowercase().email(),
    // email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  registerRequest,
  updateRequest,
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
