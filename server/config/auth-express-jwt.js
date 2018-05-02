var expressJwt = require('express-jwt');

// Try to catch default secret key
if (process.env.JWT_KEY === 'defaultsecretkey') {
  console.log('\n*\nWARNING: USING DEFAULT JWT_KEY. Site will not be secure with this key.\n*');
}

module.exports = expressJwt({secret: process.env.JWT_KEY, 
                             requestProperty: 'auth'});