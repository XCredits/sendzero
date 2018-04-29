var User = require('../models/user.model.js');
var Session = require('../models/session.model.js');
var jwt = require('jsonwebtoken');

module.exports = function (app) {
  app.post('/register', register);
  app.post('/login', login);
  app.post('/refresh-jwt', refreshJwt);
  app.post('/reset-password', resetPassword);
  app.post('/logout', logout);
}

function register(req, res) {
  // validate
  var user = new User();
  user.givenName = req.body.givenName;
  user.familyName = req.body.familyName;
  user.email = req.body.email;
  user.createPasswordHash(req.body.password);
  user.save()
      .then((user)=>{
        if (!user) {
          res.status(500).send({message:"Error in creating user"});
        } else {
          // store session
          sendJwt(user, res);
        }
      })
      .catch(()=>{
        res.status(500).send({message:"Error in creating user"});
      });

}

function login(req, res) {
  // getUserWithPassword
  // store session
  if (!user) {
    res.status(500).send({message:"Error in creating user"});
  } else {
    sendJwt(user, res);
  }
}

function refreshJwt(req, res) {
  // look up session
  // look up user
  if (user) {
    sendJwt(user, res);
  } else {
    res.status(500).send({message:"User not found"});
  }
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
  // get the session, delete it
  // return a success message
}

function sendJwt(user, res) {
  var expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);
  var jwtContent = {
    _id: user._id,
    email: user.email,
    givenName: user.givenName,
    familyName: user.familyName,
    exp: parseInt(expiry.getTime() / 1000),
  };

  var jwtResponse = jwt.sign(jwtContent, process.env.JWT_KEY);
  res.json({jwt: jwtResponse});
}