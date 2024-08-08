const mongoose = require('mongoose');

const emptySchema = new mongoose.Schema({}, { strict: false });
const ActivityModel = mongoose.model('activity', emptySchema, 'activity');

module.exports = ActivityModel;
