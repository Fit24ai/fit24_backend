const mongoose = require('mongoose');

const emptySchema = new mongoose.Schema({}, { strict: false });
const DailyModel = mongoose.model('daily', emptySchema, 'daily');

module.exports = DailyModel;
