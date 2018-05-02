// This authentication controller is attempting to achieve best-in-class 
// security and flexibility by:
// 1) Using JWTs to allow for microservices to be authorised without having 
//    access to a session database
// 2) Using JWT Refresh Tokens to allow persistent sessions
// 3) Storing JWT Refresh Tokens such that the refresher can be revoked, meaning
//    compromised tokens will only remaing for a short while after revoking
// 4) Storing JWTs on the client side in HTTP-only, Secure cookies, so 
//    client-side JavaScript can't leak JWTs to some third party, which is 
//    useful if using unverified third-party JavaScript on your site
// 5) Using Cross-site request forgery tokens to ensure that the API routes
//    cannot be exploited by loading URLs on other sites, e.g. 
//    <img src="https://yoursite.com/api/delete-account">
// 6) Because it relies on cookies and built-in Angular XSRF support, no 
//    front-end middleware is required to authenticate the request 
//    (Setting XSRF-TOKEN cookie means that Angular will automatically attach 
//    the XSRF token to the X-XSRF-TOKEN header. Read more:
//         https://stormpath.com/blog/angular-xsrf)
// 7) Passport is used to define the authentication method, so it can be 
//    extended to support all kinds of login methodologies. 
// Read more:
// https://stormpath.com/blog/where-to-store-your-jwts-cookies-vs-html5-web-storage

const User = require('../models/user.model.js');
const Session = require('../models/session.model.js');
const jwt = require('jsonwebtoken');
const auth = require('../config/jwt-auth.js');
const passport = require('passport');
const crypto = require('crypto');
require('../config/passport.js');

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
      .then(() => {
        createAndSendRefreshAndSessionJwt(user, req, res);
      })
      .catch(err => {
        res.status(500).send({
            message: "Error in creating user during registration: " + err});
      });
}

function login(req, res) {
  passport.authenticate('local', function(err, user, info){
    if (err) {
      return res.status(500).json(err);
    }
    if (!user) {
      return res.status(401)
          .send({message:"Error in finding user: " + info.message});
    }
    createAndSendRefreshAndSessionJwt(user, req, res);
  }) (req, res);
}

function refreshJwt(req, res) {
  // Pull the user data from the JWT
  var user = {
    _id: req.jwtRefreshToken.sub,
    username: req.jwtRefreshToken.username,
  };
  setJwtCookie(user, req.jwtRefreshToken.xsrf, res)
  res.send({message:"JWT successfully refreshed."});
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

function createAndSendRefreshAndSessionJwt(user, req, res) {
  // Create cross-site request forgery token
  var xsrf = crypto.randomBytes(8).toString('hex');
  // Setting XSRF-TOKEN cookie means that Angular will automatically attach the 
  // XSRF token to the X-XSRF-TOKEN header. 
  // Read more: https://stormpath.com/blog/angular-xsrf
  res.cookie('XSRF-TOKEN', xsrf, {secure: !process.env.IS_LOCAL});

  setJwtCookie(user, xsrf, res);
  var refreshToken = setJwtRefreshTokenCookie(user, xsrf, res);

  var userAgent = req.header('User-Agent');
  userAgent = userAgent.substring(0, 512);

  var session = new Session();
  session.userId = refreshToken.jwtObj.sub;
  session.sessionId = refreshToken.jwtObj.jti;
  session.exp = refreshToken.jwtObj.exp;
  session.userAgent = userAgent;
  session.lastObserved = Date.now();
  session.save()
      .then(()=>{
        res.json(user.frontendData());
      })
      .catch(()=>{
        res.status(500).json({message:"Error saving session."})
      });
}

function setJwtCookie(user, xsrf, res) {
  var expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + process.env.JWT_EXPIRY_MINS);
  var jwtId = crypto.randomBytes(8).toString('hex');
  var jwtObj = {
    sub: user._id,
    jti: jwtId,
    username: user.username,
    xsrf: xsrf,
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

function setJwtRefreshTokenCookie(user, xsrf, res) {
  var expiry = new Date();
  expiry.setMinutes(expiry.getDay() + 
      process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS);
  var jwtId = crypto.randomBytes(8).toString('hex');
  var jwtObj = {
    sub: user._id,
    jti: jwtId,
    username: user.username,
    xsrf: xsrf,
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
