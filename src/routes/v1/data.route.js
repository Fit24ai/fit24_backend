/* eslint-disable prettier/prettier */

const express = require('express');
const {dataController} = require('../../controllers');
const auth = require('../../middlewares/auth');


const router = express.Router();
router.get('/steps/:type',auth.user, dataController.getStepsData);

router.get('/:type/:userId',auth.user, dataController.getData);
router.post('/:type/update', auth.user, dataController.dailyUpdate);


module.exports = router;