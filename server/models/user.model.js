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
  // https://hackernoon.com/your-node-js-authentication-tutorial-is-wrong-f1a3bf831a46
  // https://codahale.com/how-to-safely-store-a-password/
  // https://security.stackexchange.com/questions/4781/do-any-security-experts-recommend-bcrypt-for-password-storage/6415#6415

  // var saltRouns = 12;
  // var hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
  // Store hash in your password DB.
  this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 4096, 64, 'sha512')
      .toString('hex');
};

UserSchema.methods.checkPassword = function(password) {
  var passwordHash = crypto.pbkdf2Sync(password, this.salt, 4096, 64, 'sha512')
      .toString('hex');
  return passwordHash === this.passwordHash;
};

module.exports = mongoose.model('User', UserSchema);