var User = require('../models/user.model.js');
var Session = require('../models/session.model.js');
var jwt = require('jsonwebtoken');
const auth = require('../config/jwt-auth.js');
const passport = require('passport');

module.exports = function (app) {
  app.use(passport.initialize());
  app.post('/api/user/register', register);
  app.post('/api/user/login', login);
  app.post('/api/user/refresh-jwt', auth.jwtRefreshToken, refreshJwt);
  app.post('/api/user/change-password', auth.jwtRefreshToken, changePassword);
  app.post('/api/user/reset-password', resetPassword);
  app.post('/api/user/logout', auth.jwtRefreshToken, logout);
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
          createAndSendRefreshAndSessionJwt(user, res);
        }
      })
      .catch(()=>{
        res.status(500).send({message:"Error in creating user"});
      });
}

function login(req, res) {
  passport.authenticate('local', function(err, userResult, info){
    if (err) {
      res.status(500).json(err);
      return;
    }
    if (!user) {
      return res.status(401).send({message:"Error in finding user"});
    }
    createAndSendRefreshAndSessionJwt(user, res);
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
  // get the session from the cookie
  // delete it from the DB
  // delete the cookie
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
