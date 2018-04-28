var User = require('../models/user.model.js');
var Session = require('../models/session.model.js');
var jwt = require('jsonwebtoken');

module.exports = function (app) {
  app.post('/register', register);
  app.post('/login', login);
  app.post('/refresh-jwt', refreshJwt);
  app.post('/reset-password', resetPassword);
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
        if (user) {
          // store session
          sendJwt(user, res);
        } else {
          res.status(500).send({message:"Error in creating user"});
        }
      })
      .catch(()=>{
        res.status(500).send({message:"Error in creating user"});
      });

}

function login(req, res) {
  // getUserWithPassword
  // store session
  if (user) {
    sendJwt(user, res);
  } else {
    res.status(500).send({message:"Error in creating user"});
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

  var jwtResponse = jwt.sign(jwtContent, process.env.jwtKey);
  res.json({jwt: jwtResponse});
}