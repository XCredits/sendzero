var mongoose = require('mongoose');
mongoose.Promise = require("bluebird");
var Schema = mongoose.Schema;

var MailingListSchema = new Schema({
    givenName: {type: String},
    familyName: {type: String},
    email: {type: String, required: true},
    timeSubscribe: {type: Date, default: Date.now},
    timeUnsubscribe: {type: Date},
    userId: {type: String},
  }
);

UserSchema.index({ userId: 1 });
UserSchema.index({ timeSubscribe: 1 });
UserSchema.index({ email: 1 });


module.exports = mongoose.model('MailingList', MailingListSchema);