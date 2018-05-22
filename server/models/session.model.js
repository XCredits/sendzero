const mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    userId: {type: String, required: true},
    exp: {type: Date, required: true},
    userAgent: {type: String, maxlength: 512},
    lastObserved: {type: Date, required: true}
  }
);

SessionSchema.index({ userId: 1 });

module.exports = mongoose.model('Session', SessionSchema);