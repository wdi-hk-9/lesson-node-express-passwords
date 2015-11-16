var express       = require('express');
var path          = require('path');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var app           = express();
var mongoose      = require('mongoose');
var User          = require('./models/User');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/authentication-practise');

// Only render errors in development
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.post("/signup", function(req, res) {
  var userParams = req.body.user;

  var userObject = new User(userParams);

  if (userParams.email == undefined || userParams.password == undefined || userParams.passwordConfirmation == undefined) {
    return res.status(401).send({message: "Please provide an email, a password, and password confirmation for signup"});
  }

  if (userParams.password != userParams.passwordConfirmation) {
    return res.status(401).send({message: "Password does not match"});
  }

  userObject.save(function(err, user) {
    if(err){
      return res.status(401).send({message: err.errmsg});
    } else {
      return res.status(200).send({message: "user created"});
    }
  });
});

app.post("/signin", function(req, res) {
  var userParams = req.body.user;

  // Validation for undefined email or password
  if (userParams.email == undefined || userParams.password == undefined) {
    return res.status(401).send({message: "Please provide an email and a password for authentication"});
  }

  User.findOne({ email: userParams.email }, function(err, user) {

    user.authenticate(userParams.password, function(err, isMatch) {
      if (err) throw err;

      if (isMatch) {
        return res.status(200).send({message: "Valid Credentials !"});
      } else {
        return res.status(401).send({message: "The credentials provided do not correspond to a registered user"});
      }
    });
  });
});

app.listen(3000);
