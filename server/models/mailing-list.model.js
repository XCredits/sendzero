var mongoose = require('mongoose');
var Promise = require("bluebird");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var MailingListSchema = new Schema({
    givenName: {type: String},
    familyName: {type: String},
    email: {type: String, required: true},
    timeSubscribe: {type: Date, default: Date.now},
    timeUnsubscribe: {type: Date},
  }
);

module.exports = mongoose.model('MailingList', MailingListSchema);