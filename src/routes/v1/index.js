const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const webhookRoute = require('./webhook.route');
const dailyRoute = require('./daily.route');
const dataRoute = require('./data.route');

const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/webhook',
    route: webhookRoute,
  },
  {
    path: '/daily',
    route: dailyRoute,
  },
  {
    path: '/data',
    route: dataRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
