const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;

let MailingListSchema = new Schema({
    givenName: {type: String},
    familyName: {type: String},
    email: {type: String, required: true},
    timeSubscribe: {type: Date, default: Date.now},
    timeUnsubscribe: {type: Date},
    userId: {type: String},
  }
);

MailingListSchema.index({userId: 1});
MailingListSchema.index({timeSubscribe: 1});
MailingListSchema.index({email: 1});


module.exports = mongoose.model('MailingList', MailingListSchema);
