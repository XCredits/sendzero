var User = require('../models/user.model.js');
var Session = require('../models/session.model.js');
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var jwtAuth = require('../config/auth-express-jwt.js');
const expressSession = require('express-session');
const passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(expressSession);

// https://www.youtube.com/watch?v=g32awc4HrLA

// mongoose.connect(process.env.MONGODB_URI); // may not be needed
console.log("mongoose.connection");
console.log(mongoose.connection);

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



passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    console.log('Authentication starting\n sdasd\n\nsdfds\n\n');
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.checkPassword(password)) {
        return done(null, false, {
          message: 'Password is incorrect'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));
 
passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
	User.findById(_id, function (err, user) {
		done(err, user);
	});
});





 



module.exports = function (app) {
  // const sessAuth1 = ;
  app.use(expressSession(sessionSettings));
  app.use(passport.initialize());
  // const sessAuth2 = ;
  app.use(passport.session());


  app.post('/api/user/register', register);
  app.post('/api/user/login', login);
  app.post('/api/user/refresh-jwt', refreshJwt);
  app.post('/api/user/change-password', jwtAuth, changePassword);
  app.post('/api/user/reset-password', resetPassword);
  app.post('/api/user/logout', logout);
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
          console.log("Starting authenticate2");
          console.log("Pre authenticate");
          passport.authenticate('local', function(err, userResult, info){
            console.log("Got into authenticate");
            // If Passport throws/catches an error
            if (err) {
              console.log('error')
              console.log(err);
              res.send(500).json(err);
              return;
            }
            createAndSendRefreshAndSessionJwt(user, res);
          });
          console.log("Passed over authenticate");
        }
      })
      .catch(()=>{
        res.status(500).send({message:"Error in creating user"});
      });
}

function login(req, res) {
  // getUserWithPassword
  // store session
  console.log("Starting authenticate");
  passport.authenticate('local', function(err, user, info){
    console.log("Got into authenticate");
    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    if (!user) {
      return res.status(500).send({message:"Error in finding user"});
    } else {
      createAndSendRefreshAndSessionJwt(user, res);
    }
  }) (req, res);
}

function refreshJwt(req, res) {
  // Extract session cookie and decode
  // look up session
  // Determine if expired
  // Note we look up user

  // Pull the user data from the JWT
  
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
  // get the session from the cookie, delete it
  // return a success message
}

function createAndSendRefreshAndSessionJwt(user, res) {
  // Create JWT
  var xrsf = crypto.randomBytes(8).toString('hex');
  setJwtCookie(user, xrsf, res);
  var refreshToken = setJwtRefreshTokenCookie(user, xrsf, res);

  var userAgent = '';

  var session = new Session();
  session.userId = refreshToken.jwtObj.sub;
  session.sessionId = refreshToken.jwtObj.jti;
  session.exp = refreshToken.jwtObj.exp;
  session.userAgent = userAgent;
  session.lastObserved = Date.now();
  session.save()
      .then(()=>{
        res.json({xsrf: xrsf, user: user.frontendData()});
      })
      .catch(()=>{
        res.status(500).json({message:"Error saving session."})
      });
}

function setJwtCookie(user, xrsf, res) {
  var expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + process.env.JWT_EXPIRY_MINS);
  var jwtId = crypto.randomBytes(8).toString('hex');
  var jwtObj = {
    sub: user._id,
    jti: jwtId,
    username: user.username,
    xrsf: xrsf,
    exp: parseInt(expiry.getTime() / 1000),
  };
  var jwtString = jwt.sign(jwtObj, process.env.JWT_KEY);
  // Set the cookie
  res.cookie('JWT', jwtString, {
      httpOnly: true,
      secure: !process.env.IS_LOCAL,
    });
  return {jwtString, jwtObj};
}

function setJwtRefreshTokenCookie(user, xrsf, res) {
  var expiry = new Date();
  expiry.setMinutes(expiry.getDays() + 
      process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS);
  var jwtId = crypto.randomBytes(8).toString('hex');
  var jwtObj = {
    sub: user._id,
    jti: jwtId,
    username: user.username,
    xrsf: xrsf,
    exp: parseInt(expiry.getTime() / 1000),
  };
  var jwtString = jwt.sign(jwtObj, process.env.JWT_REFRESH_TOKEN_KEY);
  // Set the cookie
  res.cookie('JWT_REFRESH_TOKEN', jwtString, {
      httpOnly: true,
      secure: !process.env.IS_LOCAL,
    });
  return {jwtString, jwtObj};
}
