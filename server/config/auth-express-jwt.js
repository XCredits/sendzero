var expressJwt = require('express-jwt');

// Try to catch default secret key
if (process.env.JWT_KEY === 'defaultsecretkey') {
  console.log('\n*\n*WARNING: USING DEFAULT JWT_KEY. Site will not be secure with this key.\n*\n*');
}

module.exports = expressJwt({secret: process.env.JWT_KEY, 
                             requestProperty: 'auth'});