var createError = require('http-errors');
var express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const passport = require('passport');
const session = require('express-session');

var router = require('./src/routes');
// var usersRouter = require('./routes/users');

let configPath = path.join(process.cwd(), 'config', 'develop.yaml');
let config = yaml.load(fs.readFileSync(configPath));

let mongoConfig = _.get(config, 'mongo');

const mongoose = require('mongoose');
mongoose
  .connect(`mongodb://${mongoConfig['ip']}:${mongoConfig['port']}/${mongoConfig['database']}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => {
    console.error(e);
    throw new Error('mongo DB connection fail');
  });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'SECRET',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;