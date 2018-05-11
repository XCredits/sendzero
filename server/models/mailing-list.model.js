var mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
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