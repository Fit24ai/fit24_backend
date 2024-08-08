const passport = require('passport');
const ApiError = require('../utils/ApiError');
// const { roleRights } = require('../config/roles');

// const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
//   if (err || info || !user) {
//     return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
//   }
//   req.user = user;

//   if (requiredRights.length) {
//     const userRights = roleRights.get(user.role);
//     const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
//     if (!hasRequiredRights && req.params.userId !== user.id) {
//       return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
//     }
//   }

//   resolve();
// };

// const auth =
//   (...requiredRights) =>
//   async (req, res, next) => {
//     return new Promise((resolve, reject) => {
//       passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
//     })
//       .then(() => next())
//       .catch((err) => next(err));
//   };

// module.exports = auth;

// % new

const verifyCallback = (req, res, next) => (err, user, info) => {
  if (err) return next(err);
  if (!user || info || user.role !== 'admin') {
    // return res.status(403).json({ msg: 'Access denied' });
    throw new ApiError(403, 'Access denied');
  }
  req.user = user;
  next();
};

const auth = {
  user: passport.authenticate('jwt', { session: false }),
  admin: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, res, next))(req, res, next);
  },
};

module.exports = auth;
