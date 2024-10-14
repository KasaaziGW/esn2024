

var createError  = require('http-errors');
var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');
var passport     = require('passport');
var session      = require('express-session');


var app = express();
app.use(express.static(__dirname + '/node_modules'));


require('./models/models');

// Routes
var api = require('./routes/api');
var authenticate = require('./routes/authenticate')(passport);
var home = require('./routes/home');

//MongoDB
var mongoose = require('mongoose');
if(process.env.DEV_ENV){
  // For Local environment
  mongoose.connect("mongodb://localhost:27017/webapp" , { useNewUrlParser: true }).then(
    (res) => {
     console.log("Connected to Database Successfully.")
    }
  ).catch(() => {
    console.log("Connected to database failed.");
  });
}else{
  // For Production environment
  console.log("Production Not Linked Yet");
}




app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(session({
  secret:"algobasket is cool",
  resave: false,
  saveUninitialized: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());



app.use('/api', api);
app.use('/auth', authenticate);
app.use('/',home);
app.use('/welcome',home);
//app.use('/register',home);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//// Initialize Passport
var initPassport = require('./passport-init');
initPassport(passport);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  // **** render the error page ***** //
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
