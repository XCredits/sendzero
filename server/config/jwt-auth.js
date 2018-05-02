var jwt = require('jsonwebtoken');

// Try to catch default secret key
if (process.env.JWT_KEY === 'defaultsecretkey') {
  console.log('\n*\nWARNING: USING DEFAULT JWT_KEY. Site will not be secure with this key.\n*\n');
}

if (process.env.JWT_REFRESH_TOKEN_KEY === 'defaultsecretkey') {
  console.log('\n*\nWARNING: USING DEFAULT JWT_REFRESH_TOKEN_KEY. Site will not be secure with this key.\n*\n');
}

module.exports = {
  jwtAuth: function (req, res, next) {
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
    req.jwt = payload;
    next();
  },
  jwtRefreshTokenAuth: function (req, res, next) {
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
    req.jwtRefreshToken = payload;
    next();
  },

};