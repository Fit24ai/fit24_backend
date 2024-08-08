const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { validateMongodbId } = require('../utils/validateMongodbId');
const { userStatus } = require('../utils/constant');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

// % working-1
const getUser = catchAsync(async (req, res) => {
  // const user = await userService.getUserById(req.params.userId);
  validateMongodbId(req?.user?._id);
  const id = req.user._id;
  const result = await userService.getUserById(id);
  const user = result.toObject();
  delete user.password;
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }
  res.send({ status: 1, data: user });
});

const updateUser = catchAsync(async (req, res) => {
  validateMongodbId(req?.user?._id);
  const id = req.user._id;
  console.log(55, req.user._id);
  // console.log(12111, req.user);
  // const user = await userService.updateUserById(req.params.userId, req.body);
  const result = await userService.updateUserById(id, req.body);
  const user = result.toObject();
  delete user.password;
  res.send({ status: 1, data: user });
});

const userDeletedPermanently = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.permanentUserDeleted(userId);
  if (user) {
    res.status(200).send({ status: 1, message: 'Permanently User already deleted successfully.' });
  }
});

const deleteUser = catchAsync(async (req, res) => {
  validateMongodbId(req?.user?._id);
  const userId = req.user._id;
  const user = await userService.deleteUserById(userId);
  if (user.isActive === userStatus.ACTIVE) {
    res.send({ status: 1, message: 'User deleted successfully.' });
  } else if (user.isActive === userStatus.IN_ACTIVE) {
    res.send({ status: 1, message: 'User already deleted successfully.' });
  }
});

const logoutUser = catchAsync(async (req, res) => {
  try {
    const { token } = req.cookies;
    const userId = req.user._id;
    await userService.logoutUser(userId, token);

    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // Ensure secure cookies in production
    });
    res.status(200).send({ status: 1, message: 'User logged out successfully.' }); //
  } catch (error) {
    console.error('Error...', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  logoutUser,
  userDeletedPermanently,
};
