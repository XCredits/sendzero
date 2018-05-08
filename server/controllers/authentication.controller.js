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

// Important notes:

// When blocking routes using the authentication controller, the rejection is
// always a 401, which, in the application front-end, forces the app to go to a 
// login form. 
// When a user is logged in, but their privileges do not allow them to access 
// the content, the rejection should always be a 403. This does not result in 
// the user being redirected, instead they are informed that they cannot access
// the content specifed. In some cases, it may be necessary to prevent the user
// from knowing that a resource exists at all. In those cases, it is best to 
// return a 404. 

// It is VERY important, for security reasons, to ensure that GET and HEAD 
// events are not mutating in ANY way (including logging/analytics). The reason 
// for this is that the Angular HTTPClient service does not automatically 
// attach the XSRF Token to the request header that the server has set in the 
// cookie. This means that ALL get requests could potentially be called from any


// Next steps
// Observables: https://www.youtube.com/watch?v=Tux1nhBPl_w
// https://angular-2-training-book.rangle.io/handout/observables/using_observables.html
// https://github.com/ReactiveX/rxjs
// Use behaviour subject, then call "next" on user return https://stackoverflow.com/questions/43659462/how-to-emit-a-change-in-rxjs-based-on-a-value

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
  app.get('/api/user/refresh-jwt', auth.jwtRefreshToken, refreshJwt);
  app.get('/api/user/details', auth.jwt, userDetails);
  app.post('/api/user/change-password', auth.jwtRefreshToken, changePassword);
  app.post('/api/user/reset-password', resetPassword);
  app.post('/api/user/forgot-username', forgotUsername);
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
      auth.clearTokens();
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
  const token = setJwtCookie(user, req.jwtRefreshToken.xsrf, res)
  res.send({
      jwtExp: token.jwtObj.exp,
      message:"JWT successfully refreshed."
  });
}

function userDetails(req, res) {
  User.findOne({_id:req.userId})
      .then(user => {
        res.send(user.frontendData());
      });
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
  // https://www.owasp.org/index.php/Forgot_Password_Cheat_Sheet#Step_4.29_Allow_user_to_change_password_in_the_existing_session
  // create JWT that establishes an authetication session ONLY for reset password routes
  // 
}

function forgotUsername(req, res) {
  // find all users by email
  // send all user names to email
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

  const token = setJwtCookie(user, xsrf, res);
  const refreshToken = setJwtRefreshTokenCookie(user, xsrf, res);

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
        res.json({
            user: user.frontendData(), 
            jwtExp: token.jwtObj.exp, 
            jwtRefreshTokenExp: token.jwtObj.exp,
        });
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
    isAdmin: user.isAdmin,
    xsrf: xsrf,
    exp: parseInt(expiry.getTime() / 1000, 10),
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
    isAdmin: user.isAdmin,
    xsrf: xsrf,
    exp: parseInt(expiry.getTime() / 1000, 10),
  };
  var jwtString = jwt.sign(jwtObj, process.env.JWT_REFRESH_TOKEN_KEY);
  // Set the cookie
  res.cookie('JWT_REFRESH_TOKEN', jwtString, {
      httpOnly: true,
      secure: !process.env.IS_LOCAL,
    });
  return {jwtString, jwtObj};
}
