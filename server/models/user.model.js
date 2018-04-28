var mongoose = require('mongoose');
var Promise = require("bluebird");
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
    givenName: {type: String},
    familyName: {type: String},
    email: {type: String, required: true},
    timeRegister: {type: Date, default: Date.now},
    passwordHash: String,
    salt: String
  }
);

UserSchema.methods.createPasswordHash = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 4096, 64, 'sha512')
      .toString('hex');
};

UserSchema.methods.checkPassword = function(password) {
  var passwordHash = crypto.pbkdf2Sync(password, this.salt, 4096, 64, 'sha512')
      .toString('hex');
  return passwordHash === this.passwordHash;
};

module.exports = mongoose.model('User', UserSchema);