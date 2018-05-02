var mongoose = require('mongoose');
var Promise = require("bluebird");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    userId: {type: String, required: true},
    sessionId: {type: String, required: true},
    exp: {type: Date, required: true},
    userAgent: {type: String},
    lastObserved: {type: Date, required: true}
  }
);

SessionSchema.index({ userId: 1 });
SessionSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Session', SessionSchema);