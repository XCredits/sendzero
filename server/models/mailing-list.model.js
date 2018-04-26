var mongoose = require('mongoose');
var Promise = require("bluebird");
mongoose.Promise = Promise;
var Schema = mongoose.Schema;

var MailingListSchema = new Schema({
    givenName: {type: String, max: 100},
    familyName: {type: String, max: 100},
    email: {type: String, required: true},
    timeSubscribe: {type: Date, default: Date.now()},
    timeUnsubscribe: {type: Date},
  }
);

//Export model
module.exports = mongoose.model('MailingList', MailingListSchema);