var User = require('../models/user.model.js');
var SessionModel = require('../models/session.model.js');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var jwtAuth = require('../config/auth-express-jwt.js');
const expressSession = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(expressSession);

// https://www.youtube.com/watch?v=g32awc4HrLA

// mongoose.connect(process.env.MONGODB_URI); // may not be needed

// Express session and passport session is only used on routes where passwords 
// are set and entered and when the JWT is refreshed
var sessionSettings = {
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
};

// if (process.env.production) {
//   sessionSettings.secure = true;
// }

const sessAuth1 = expressSession(sessionSettings);
const sessAuth2 = passport.session();

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
	User.findById(_id, function (err, user) {
		done(err, user);
	});
});


module.exports = function (app) {
  app.post('/register', register);
  app.post('/login', login);
  app.post('/refresh-jwt', sessAuth1, sessAuth2, refreshJwt);
  app.post('/change-password', jwtAuth, changePassword);
  app.post('/reset-password', resetPassword);
  app.post('/logout', logout);
}

function register(req, res) {
  // validate
  var user = new User();
  user.givenName = req.body.givenName;
  user.familyName = req.body.familyName;
  user.username = req.body.username;
  user.email = req.body.email;
  user.createPasswordHash(req.body.password);
  user.save()
      .then((user)=>{
        if (!user) {
          res.status(500).send({message:"Error in creating user"});
        } else {
          // store session
          // passport.authenticate???
          sendJwt(user, res);
        }
      })
      .catch(()=>{
        res.status(500).send({message:"Error in creating user"});
      });
}

function login(req, res) {
  // getUserWithPassword
  // store session
  passport.authenticate('local', function(err, user, info){
    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    if (!user) {
      return res.status(500).send({message:"Error in finding user"});
    } else {
      return sendJwt(user, res);
    }
  });
}

function refreshJwt(req, res) {
  // look up session
  // look up user
  if (user) {
    sendJwt(user, res);
  } else {
    res.status(500).send({message:"User not found"});
  }
}

function changePassword(req, res) {
  // look up user
  // user.createPasswordHash(req.body.password);
  // user.save()
  // res.send()
}

function resetPassword(req, res) {
  // look up user
  // user.createPasswordHash(req.body.password);
  // user.save()
  // res.send()
}

function forgotPassword(req, res) {
  // https://www.owasp.org/index.php/Forgot_Password_Cheat_Sheet#Step_4.29_Allow_user_to_change_password_in_the_existing_session
  // create JWT that establishes an authetication session ONLY for reset password routes
  // 
}

function logout(req, res) {
  // get the session, delete it
  // return a success message
}

function sendJwt(user, res) {
  var expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  var jwtContent = {
    _id: user._id,
    username: user.username,
    email: user.email,
    givenName: user.givenName,
    familyName: user.familyName,
    exp: parseInt(expiry.getTime() / 1000),
  };

  var jwtResponse = jwt.sign(jwtContent, process.env.JWT_KEY);
  res.json({jwt: jwtResponse});
}