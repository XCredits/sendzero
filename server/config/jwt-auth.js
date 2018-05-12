var jwt = require('jsonwebtoken');
var Session = require('../models/session.model.js');

// Try to catch default secret key
if (process.env.JWT_KEY === 'defaultsecretkey') {
  console.log('\n*\nWARNING: USING DEFAULT JWT_KEY. Site will not be secure with this key.\n*\n');
}

if (process.env.JWT_REFRESH_TOKEN_KEY === 'defaultsecretkey') {
  console.log('\n*\nWARNING: USING DEFAULT JWT_REFRESH_TOKEN_KEY. Site will not be secure with this key.\n*\n');
}

module.exports = {
  jwt: function (req, res, next) {
    if(!req.cookies.JWT){
      return res.status(401)
        .json({message:"JWT authenthication error: JWT cookie not set"});
    }
    try {
      var payload = jwt.verify(req.cookies.JWT, process.env.JWT_KEY);
    } catch (err) {
      clearTokens(res);
      return res.status(401)
        .json({message:"JWT authenthication error: JWT is not verified"});
    }
    // Get out XSRF header & compare to XSRF
    // Don't block non-mutating requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.header('X-XSRF-TOKEN') !== payload.xsrf) {
        return res.status(401)
          .json({message:"JWT authenthication error: XSRF does not match"});
      }
    }
    req.jwt = payload;
    req.userId = payload.sub;
    req.username = payload.username;
    next();
  },

  isAdmin: function (req, res, next) {
    if (!req.jwt) {
      return res.status(500)
          .json({message: 'Access to auth.admin used, but auth.jwt not called prior to auth.admin'});
    }
    if (!req.jwt.isAdmin) {
      return res.status(403)
          .json({message: 'You do not have the admin privileges needed to access this content.'});;
    }
    next();
  },

  jwtRefreshToken: function (req, res, next) {
    if(!req.cookies.JWT_REFRESH_TOKEN){
      return res.status(401)
        .json({message:"JWT Refresh Token authenthication error: JWT Refresh Token cookie not set"});
    }
    try {
      var payload = jwt.verify(req.cookies.JWT_REFRESH_TOKEN, 
          process.env.JWT_REFRESH_TOKEN_KEY);
    } catch (err) {
      clearTokens(res);
      return res.status(401)
        .json({message:"JWT Refresh Token authenthication error: JWT Refresh Token is not verified"});
    }
    // Get out XSRF header & compare to XSRF
    // Don't block non-mutating requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.header('X-XSRF-TOKEN') !== payload.xsrf) {
        return res.status(401)
          .json({message:"JWT Refresh Token authenthication error: XSRF does not match"});
      }
    }
    return Session.findOne({_id: payload.jti})
        .then(session=>{
          if (!session) {
            return res.status(401)
                .json({message:"JWT Refresh Token authenthication error: Session not found in DB"});
          }
          // Success
          req.jwtRefreshToken = payload;
          req.userId = payload.sub;
          req.username = payload.username;
          next(); 
          return null;// should return null as may contain promises and there is a promise above
        })
        .catch(err=>{
          return res.status(401)
              .json({message:"JWT Refresh Token authenthication error: Problem getting session from DB"});
        });
  },

  jwtTemporaryLinkToken: function(req, res, next){
    if(!req.body.jwt){
      return res.status(401)
        .send({message: 'JWT token not sent'});
    }
    try {
      var payload = jwt.verify(req.body.jwt, process.env.JWT_KEY);
    } catch (err) {
      return res.status(401)
        .send({message:"JWT temporary link authenthication error: JWT is not verified"});
    }
    req.userId = payload.sub;
    next();
  },

  clearTokens: clearTokens, 
};

function clearTokens(res) {
  res.clearCookie('JWT');
  res.clearCookie('JWT_REFRESH_TOKEN');
  res.clearCookie('XSRF-TOKEN');
}