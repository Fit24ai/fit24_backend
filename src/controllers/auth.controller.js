const httpStatus = require('http-status');
const { default: Terra } = require('terra-api');
const axios = require('axios');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ status: 1, data: user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(result);
  // const user = result.toObject();
  // delete user.password;
  // delete result.password = '';
  res.cookie('token', tokens.access.token, {
    httpOnly: true, // Prevents JavaScript access
    secure: true, // Ensures the cookie is sent over HTTPS
    sameSite: 'Strict', // Helps prevent CSRF
    maxAge: 24 * 3600000, // 24 hour in milliseconds
  });
  delete result.password;
  res.send({ status: 1, data: result, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(200).send({ status: 1, message: 'Password reset email sent successfully.', token: resetPasswordToken });
});

const resetPassword = catchAsync(async (req, res) => {
  console.log(req.query, req.body);
  const result = await authService.resetPassword(req.query.token, req.body.password);
  if (result) {
    res.status(200).send({ status: 1, message: 'Your password has been successfully reset.' });
  }
  // res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const generateWidgetSession = catchAsync(async (req, res) => {
  const terra = new Terra(process.env.DEV_ID, process.env.API_KEY, process.env.SECRET);
  const { userId } = req.params;
  terra
    .generateWidgetSession({
      showDisconnect: true,
      providers: ['GARMIN', 'APPLE', 'FITBIT', 'SAMSUNG', 'OURA', 'POLAR', 'GOOGLE'],
      referenceID: userId,
      // auth_success_redirect_url: 'exp://192.168.0.108:8081',
    })
    .then((result) => {
      if (result && result.url) {
        res.status(200).json({
          status: 'success',
          code: 200,
          message: 'Widget session generated successfully',
          data: { url: result },
        });
      } else {
        res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'No data found for the widget session',
        });
      }
    })
    .catch((e) => {
      console.error('Error generating widget session:', e);
      res.status(500).json({
        status: 'error',
        code: 500,
        message: 'An error occurred while generating the widget session',
        error: e.message,
      });
    });
});

const getUserInfo = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const options = {
    method: 'GET',
    url: `https://api.tryterra.co/v2/userInfo?reference_id=${userId}`,
    headers: {
      accept: 'application/json',
      'dev-id': process.env.DEV_ID,
      'content-type': 'application/json',
      'x-api-key': process.env.API_KEY,
    },
  };

  axios(options)
    .then(async (response) => {
      const result = response.data;
      await userService.updateTerraUserById(userId, { userId: result.users[0].user_id });
      if (result && result.users) {
        res.status(200).json({
          status: 'success',
          code: 200,
          users: result.users,
        });
      } else {
        res.status(404).json({
          status: 'fail',
          code: 404,
          message: 'No data found for the reference Id',
        });
      }
    })
    .catch((e) => {
      console.error('Error getting user:', e);
      res.status(e.statusCode).json({
        status: 'error',
        code: e.statusCode,
        error: e.message,
      });
    });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  generateWidgetSession,
  getUserInfo,
};
