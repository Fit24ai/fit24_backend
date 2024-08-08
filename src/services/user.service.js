const httpStatus = require('http-status');
const { User, Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { formatDate } = require('../utils/constant');
const { tokenTypes } = require('../config/tokens');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  const isExist = await User.isEmailTaken(userBody.email);
  if (isExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
  }
  const result = await User.create(userBody);
  // console.log(4444, abc);
  return result;
  // return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const isUser = await getUserById(userId);
  if (!isUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const updatedValues = {
    firstName: updateBody?.firstName ?? isUser.firstName,
    lastName: updateBody?.lastName ?? isUser?.lastName,
    mobileNumber: updateBody?.mobileNumber ?? isUser?.mobileNumber,
    gender: updateBody.gender ?? isUser?.gender,
    city: updateBody.city ?? isUser?.city,
    pincode: updateBody.pincode ?? isUser?.pincode,
    dob: formatDate(updateBody.selectedDate ?? updateBody.dob) ?? isUser?.dob,
    age: updateBody.age ?? updateBody.age ?? isUser?.age,
    height: updateBody.height ?? isUser?.height,
    weight: updateBody.weight ?? isUser?.weight,
    country: updateBody.country ?? isUser?.country,
    address: updateBody.address ?? isUser?.address,
    goal: updateBody.goal ?? isUser?.goal,
    level: updateBody.level ?? isUser?.level,
  };
  const user = await User.findByIdAndUpdate(userId, updatedValues, {
    new: true, // return the new updated document
    // runValidators: true // validate the update operation against the model's schema
  });
  // if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  // Object.assign(user, updateBody);
  // await user.save();
  return user;
};

const updateTerraUserById = async (userId, updateBody) => {
  const isUser = await getUserById(userId);
  if (!isUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const updatedValues = {
    terraUserId: updateBody?.userId ?? isUser.terraUserId,
  };
  const user = await User.findByIdAndUpdate(userId, updatedValues, {
    new: true,
  });

  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
// const deleteUserById = async (userId) => {
//   const user = await getUserById(userId);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
//   }
//   await user.remove();
//   return user;
// };

const permanentUserDeleted = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.deleteOne();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true } // Option to return the updated document
  );
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

const logoutUser = async (userId, accessToken) => {
  if (!accessToken) {
    throw new Error('No accessToken in Cookies.');
  }

  const user = await User.findOne({ _id: userId, accessToken });

  if (!user) {
    return;
  }

  await Token.deleteMany({ user: userId, type: tokenTypes.ACCESS });
  // await Token.findOneAndUpdate({ token: accessToken }, { token: '' });
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  updateTerraUserById,
  logoutUser,
  permanentUserDeleted,
};
