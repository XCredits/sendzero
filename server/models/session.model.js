var mongoose = require('mongoose');
var Promise = require("bluebird");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    sessionString: {type: String, required: true},
    userId: {type: String, required: true},
  }
);

module.exports = mongoose.model('Session', SessionSchema);