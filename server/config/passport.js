// This file is largely copied from SitePoint. Below is their license:

// The MIT License (MIT)

// Copyright (c) 2016 SitePoint

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.model.js');

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
},
function(username, password, done) {
  User.findOne({username: username}, function(err, user) {
    if (err) {
      return done(err);
    }
    // Return if user not found in database
    if (!user) {
      return done(null, false, {
        message: 'User not found',
      });
    }
    // Return if password is wrong
    if (!user.checkPassword(password)) {
      return done(null, false, {
        message: 'Password is incorrect',
      });
    }
    // If credentials are correct, return the user object
    return done(null, user);
  });
}
));
