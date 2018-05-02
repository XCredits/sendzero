

// Try to catch default secret key
if (process.env.JWT_KEY === 'defaultsecretkey') {
  console.log('\n*\nWARNING: USING DEFAULT JWT_KEY. Site will not be secure with this key.\n*\n');
}

if (process.env.JWT_REFRESH_TOKEN_KEY === 'defaultsecretkey') {
  console.log('\n*\nWARNING: USING DEFAULT JWT_REFRESH_TOKEN_KEY. Site will not be secure with this key.\n*\n');
}

module.exports = {
  jwtAuth: function (req, res, next) {
    var errorReason;
    // jwt(authenticate)
    // if failure
    return res.status(401)
        .json({message:"JWT authenthication error: "+ errorReason});
    // attach jwt to be used later
    req.jwt = jwt.payload;
    next();
  },
  jwtRefreshTokenAuth: function (req, res, next) {
    req.jwtRefreshToken = jwtRefreshToken.payload;
    next();
  },

};