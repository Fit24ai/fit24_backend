const mongoose = require('mongoose');

const emptySchema = new mongoose.Schema({}, { strict: false });
const BodyModel = mongoose.model('body', emptySchema, 'body');

module.exports = BodyModel;
