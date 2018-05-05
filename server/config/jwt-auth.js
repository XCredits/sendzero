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
      return res.status(401)
        .json({message:"JWT authenthication error: JWT is not verified"});
    }
    // Get out XSRF header & compare to XSRF
    // Don't block non-mutating requests
    if (req.method !== "GET" || req.method !== "HEAD") {
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

  jwtRefreshToken: function (req, res, next) {
    if(!req.cookies.JWT_REFRESH_TOKEN){
      return res.status(401)
        .json({message:"JWT Refresh Token authenthication error: JWT Refresh Token cookie not set"});
    }
    try {
      var payload = jwt.verify(req.cookies.JWT_REFRESH_TOKEN, 
          process.env.JWT_REFRESH_TOKEN_KEY);
    } catch (err) {
      return res.status(401)
        .json({message:"JWT Refresh Token authenthication error: JWT Refresh Token is not verified"});
    }
    // Get out XSRF header & compare to XSRF
    // Don't block non-mutating requests
    if (req.method !== "GET" || req.method !== "HEAD") {
      if (req.header('X-XSRF-TOKEN') !== payload.xsrf) {
        return res.status(401)
          .json({message:"JWT Refresh Token authenthication error: XSRF does not match"});
      }
    }
    Session.findOne({sessionId: payload.jti})
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
        })
        .catch(err=>{
          return res.status(401)
              .json({message:"JWT Refresh Token authenthication error: Problem getting session from DB"});
        });

    
  },

};