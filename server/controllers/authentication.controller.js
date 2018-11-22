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

const validator = require('validator');
const User = require('../models/user.model.js');
const UserStats = require('../models/user-stats.model.js');
const statsService = require('../services/stats.service.js');
const emailService = require('../services/email.service.js');
const Session = require('../models/session.model.js');
const jwt = require('jsonwebtoken');
const auth = require('../config/jwt-auth.js');
const passport = require('passport');
const crypto = require('crypto');
require('../config/passport.js');

const usernameRegex = /^[a-zA-Z0-9_.-]*$/;

module.exports = function(app) {
  app.use(passport.initialize());
  app.post('/api/user/register', register);
  app.post('/api/user/login', login);
  app.get('/api/user/refresh-jwt', auth.jwtRefreshToken, refreshJwt);
  app.get('/api/user/details', auth.jwt, userDetails);
  app.post('/api/user/change-password', auth.jwtRefreshToken, changePassword);
  app.post('/api/user/request-reset-password', requestResetPassword);
  app.post('/api/user/reset-password',
      auth.jwtTemporaryLinkToken, resetPassword);
  app.post('/api/user/forgot-username', forgotUsername);
  app.post('/api/user/logout', auth.jwtRefreshToken, logout);
};

/**
 * registers a user
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function register(req, res) {
  // Extract req.body
  const email = req.body.email;
  const givenName = req.body.givenName;
  const familyName = req.body.familyName;
  const password = req.body.password;
  let username = req.body.username;

  // Validate
  if (typeof email !== 'string' ||
      typeof givenName !== 'string' ||
      typeof familyName !== 'string' ||
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !validator.isEmail(email) ||
      !usernameRegex.test(username) ||
      !validator.isLength(password, 8)
    ) {
    return res.status(422).json({message: 'Request failed validation'});
  }

  // Sanitize
  username = username.toLowerCase();

  // check that there is not an existing user with this username
  return User.findOne({username: username})
      .then((existingUser) => {
        if (existingUser) {
          return res.status(409).send({message: 'Username already taken.'});
        }
        const user = new User();
        user.givenName = givenName;
        user.familyName = familyName;
        user.username = username;
        user.email = email;
        user.createPasswordHash(password);
        return user.save()
            .then(() => {
              // The below promises are structured to report failure but not
              // block on failure
              return createAndSendRefreshAndSessionJwt(user, req, res)
                  .then(()=>{
                    return statsService.increment(UserStats)
                        .catch((err)=>{
                          console.log('Error in the stats service');
                        });
                  })
                  .then(()=>{
                    return emailService.addUserToMailingList({
                          givenName, familyName, email, userId: user._id,
                        })
                        .catch((err)=>{
                          console.log('Error in the mailing list service');
                        });
                  })
                  .then(()=>{
                    return emailService.sendRegisterWelcome({
                          givenName, familyName, email,
                        })
                        .catch((err)=>{
                          console.log('Error in the send email service');
                        });
                  })
                  .catch((err) =>{
                    console.log('Error in createAndSendRefreshAndSessionJwt');
                  });
            })
            .catch((dbError) => {
              let err;
              if (process.env.NODE_ENV !== 'production') {
                // DO NOT console.log or return Mongoose catch errors to the
                // front-end in production, especially for user objects. They
                // contain secret information. e.g. if you try to create a user
                // with a username that already exists, it will return the
                // operation that you are trying to do, which includes the
                // password hash.
                err = dbError;
                console.log(dbError);
              }
              return res.status(500).send({
                  message: 'Error in creating user during registration: '
                      + err});
            });
      })
      .catch((err)=>{
        res.status(500)
            .send({
              message: 'Error accessing database while checking for existing users'});
      });
}
/**
 * logs a user in
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function login(req, res) {
  const username = req.body.username;
  // note length should not be checked when logging in
  const password = req.body.password;
  // Validate
  if (typeof username !== 'string' ||
      typeof password !== 'string' ||
      !usernameRegex.test(username)
    ) {
    return res.status(422).json({message: 'Request failed validation'});
  }
  // Sanitize (update username)
  req.body.username = username.toLowerCase();

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.status(500).json(err);
    }
    if (!user) {
      auth.clearTokens(res);
      return res.status(401)
          .send({message: 'Error in finding user: ' + info.message});
    }
    return createAndSendRefreshAndSessionJwt(user, req, res);
  })(req, res);
}

/**
 * refreshes the jwt
 * @param {*} req request object
 * @param {*} res response object
 */
function refreshJwt(req, res) {
  // The refresh token is verfied by auth.jwtRefreshToken
  // Pull the user data from the refresh JWT
  const token = setJwtCookie({
    res,
    userId: req.jwtRefreshToken.sub,
    username: req.jwtRefreshToken.username,
    isAdmin: req.jwtRefreshToken.isAdmin,
    xsrf: req.jwtRefreshToken.xsrf,
    sessionId: req.jwtRefreshToken.jwt,
  });

  res.send({
      jwtExp: token.jwtObj.exp,
      message: 'JWT successfully refreshed.',
  });
}

/**
 * returns the user details
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function userDetails(req, res) {
  // Validate not necessary at this point (no req.body use,
  // and checked in jwt-auth)
  return User.findOne({_id: req.userId})
      .then((user) => {
        res.send(user.frontendData());
      });
}

/**
 * change password
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function changePassword(req, res) {
  const password = req.body.password;
  // Validate
  if (typeof password !== 'string' ||
      !validator.isLength(password, 8)
    ) {
    return res.status(422).json({message: 'Request failed validation'});
  }

  return User.findOne({_id: req.userId})
      .then((user) => {
        // Create new password hash
        user.createPasswordHash(password);
        return user.save(()=>{
              return res.send({message: 'Password successfully changed'});
            })
            .catch((err)=>{
              console.log(err);
              return res.status(500).send({message: 'Password change failed'});
            });
  });
}

/**
 * handle a request to reset the password
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function requestResetPassword(req, res) {
  let username = req.body.username;
  // Validate
  if (typeof username !== 'string' ||
      !usernameRegex.test(username)
    ) {
    return res.status(422).json({message: 'Request failed validation'});
  }
  // Sanitize
  username = username.toLowerCase();

  return User.findOne({username: username})
      .then((user)=>{
        // Success object must be identical, to avoid people discovering
        // emails in the system
        const successObject = {message: 'Email sent if users found in database.'};
        res.send(successObject); // Note that if errors in sending emails occur, the front end will not see them
        if (!user) {
          return;
        }
        // The JWT for request password will NOT be set in the cookie
        // and hence does not require XSRF
        const jwtObj = {
          sub: user._id,
          username: user.username,
          isAdmin: user.isAdmin,
          exp: Math.floor(
              (Date.now() + Number(process.env.JWT_TEMPORARY_LINK_TOKEN_EXPIRY))/1000), // 1 hour
        };
        const jwtString = jwt.sign(jwtObj, process.env.JWT_KEY);
        const resetUrl = process.env.URL_ORIGIN +
            '/reset-password?username=' + user.username + // the username here is only display purposes on the front-end
            '&auth=' + jwtString;
        // When the user clicks on the link, the app pulls the JWT from the link
        // and stores it in the component
        return emailService.sendPasswordReset({
              givenName: user.givenName,
              familyName: user.familyName,
              email: user.email,
              username: user.username,
              userId: user._id,
              resetUrl,
            })
            .catch((err)=>{
              res.status(500).send({message: 'Could not send email.'});
            });
      })
      .catch((err) => {
        res.status(500).send({message: 'Error accessing user database.'});
      });
}

/**
 * resets the password
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function resetPassword(req, res) {
  let password = req.body.password;
  // Validate
  if (typeof password !== 'string'||
      !validator.isLength(password, 8)) {
    return res.status(422).json({message: 'Request failed validation'});
  }

  // Other ideas: https://www.owasp.org/index.php/Forgot_Password_Cheat_Sheet#Step_4.29_Allow_user_to_change_password_in_the_existing_session
  // look up user
  return User.findOne({_id: req.userId}) // req.userId is set in auth.temporaryLinkAuth
      .then((user) => {
        user.createPasswordHash(password);
        return user.save()
            .then(()=>{
              res.send({message: 'Password reset successful'});
            });
      })
      .catch(() => {
        res.status(500).send({message: 'Error accessing user database.'});
      });
}

/**
 * handles request for forgotten username
 * @param {*} req request object
 * @param {*} res request object
 * @return {*}
 */
function forgotUsername(req, res) {
  let email = req.body.email;
  // Validate
  if (typeof email !== 'string' ||
      !validator.isEmail(email)) {
    return res.status(422).json({message: 'Request failed validation'});
  }

  // find all users by email
  return User.find({email: email}).select('username givenName familyName')
      .then((users) => {
          // Success object must be identical, to avoid people
          // discovering emails in the system
          const successObject = {message: 'Email sent if users found in database.'};
          if (!users || users.length === 0) {
            res.send(successObject); // Note that if errors in send in emails occur, the front end will not see them
            return;
          }
          const userNameArr = users.map((user) => user.username);
          return emailService.sendUsernameRetrieval({
                givenName: users[0].givenName, // just use the name of the first account
                familyName: users[0].familyName,
                email: email,
                userNameArr: userNameArr,
              })
              .then(() => {
                res.send(successObject); // Note that if errors in send in emails occur, the front end will not see them
              })
              .catch((err)=>{
                res.status(500).send({message: 'Could not send email.'});
              });
      })
      .catch((err) => {
        res.status(500).send({message: 'Error accessing user database.'});
      });
}

/**
 * logout user
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function logout(req, res) {
  // Validation not necessary
  // delete it from the DB
  return Session.remove({_id: req.jwtRefreshToken.jti})
      .then(()=>{
        // needs a .then to act like a promise for Mongoose Promise
        return null;
      })
      .finally(() => {
        // delete the cookies (note this should not clear the browserId)
        auth.clearTokens(res);
        return res.send({message: 'Log out succesfful'});
      });
}

/**
 * create and send refreshed session jwt
 * @param {*} user user object
 * @param {*} req request object
 * @param {*} res response object
 * @return {*}
 */
function createAndSendRefreshAndSessionJwt(user, req, res) {
  let userAgentString = req.header('User-Agent').substring(0, 512);
  // Validate
  if (typeof userAgentString !== 'string') {
    return res.status(422).json({message: 'Request failed validation'});
  }

  // Create cross-site request forgery token
  let xsrf = crypto.randomBytes(8).toString('hex');

  const refreshTokenExpiry = Math.floor(
      (Date.now() + Number(process.env.JWT_REFRESH_TOKEN_EXPIRY))/1000);

  let session = new Session();
  session.userId = user._id;
  session.exp = new Date(refreshTokenExpiry*1000);
  session.userAgent = userAgentString;
  session.lastObserved = new Date(Date.now());
  return session.save()
      .then((session)=>{
        // Setting XSRF-TOKEN cookie means that Angular will
        // automatically attach the
        // XSRF token to the X-XSRF-TOKEN header.
        // Read more: https://stormpath.com/blog/angular-xsrf
        res.cookie('XSRF-TOKEN', xsrf, {
          secure: !process.env.IS_LOCAL,
          maxAge: 20 * 365 * 24 * 60 * 60 * 1000, // 20 year expiry
        });
        const token = setJwtCookie({
            res,
            userId: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
            xsrf,
            sessionId: session._id});
        const refreshToken = setJwtRefreshTokenCookie({
            res,
            userId: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
            xsrf,
            sessionId: session._id,
            exp: refreshTokenExpiry});
        return res.json({
            user: user.frontendData(),
            jwtExp: token.jwtObj.exp,
            jwtRefreshTokenExp: refreshToken.jwtObj.exp,
        });
      })
      .catch((err)=>{
        auth.clearTokens(res);
        return res.status(500).json({message: 'Error saving session. ' + err});
      });
}

/**
 * sets the jwt cookie
 * @param {*} param0
 * @return {*}
 */
function setJwtCookie({res, userId, username, isAdmin, xsrf, sessionId}) {
  let jwtObj = {
    sub: userId,
    // Note this id is set using the refresh token session id so that we can
    // easily determine which session is responisble for an action
    jti: sessionId,
    username: username,
    isAdmin: isAdmin,
    xsrf: xsrf,
    exp: Math.floor((Date.now() + Number(process.env.JWT_EXPIRY))/1000),
  };
  let jwtString = jwt.sign(jwtObj, process.env.JWT_KEY);
  // Set the cookie
  res.cookie('JWT', jwtString, {
      httpOnly: true,
      secure: !process.env.IS_LOCAL,
      maxAge: process.env.JWT_EXPIRY,
    });
  return {jwtString, jwtObj};
}

/**
 * sets jwt refresh token cookie
 * @param {*} param0
 * @return {*}
 */
function setJwtRefreshTokenCookie(
    {res, userId, username, isAdmin, xsrf, sessionId, exp}) {
  let jwtObj = {
    sub: userId,
    jti: sessionId,
    username: username,
    isAdmin: isAdmin,
    xsrf: xsrf,
    exp: exp,
  };
  let jwtString = jwt.sign(jwtObj, process.env.JWT_REFRESH_TOKEN_KEY);
  // Set the cookie
  res.cookie('JWT_REFRESH_TOKEN', jwtString, {
      httpOnly: true,
      secure: !process.env.IS_LOCAL,
      maxAge: process.env.JWT_REFRESH_TOKEN_EXPIRY,
    });
  return {jwtString, jwtObj};
}
