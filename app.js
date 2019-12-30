var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport')

const cors = require('cors')



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dataCenterRouter = require('./routes/dataCenter');
var osRouter = require('./routes/os');
var clusterRouter = require('./routes/cluster');
var dataStorageRouter = require('./routes/dataStorage');
var testRouter = require('./routes/test');
var clientRouter = require('./routes/client');
var vmRouter = require('./routes/vms');
var dcDetails =require('./dist/index');
var adminsRoute =require('./routes/admins');

var app = express();


const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/aladinDatabase';
mongoose.connect(url, { useNewUrlParser: true });
const mongo = mongoose.connection;
mongo.on('open', () => {
  console.log('connection etablie ...')
})


//jquery use
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bs', express.static(__dirname + '/node_modules/bootstrap'));
app.use('/chartjs', express.static(__dirname + '/node_modules/chart.js'));
app.use('/easyPieChart', express.static(__dirname + '/node_modules/easy-pie-chart'));
app.use('/countup', express.static(__dirname + '/node_modules/countup/dist'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use(session({
  name: 'sessionId',
  secret: "mysecretkeythatiwillnottellyou",
  saveUninitialized: false, // don't create sessions for not logged in users
  resave: false, //don't save session if unmodified
  
  // Where to store session data
  store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 1 * 24 * 60 * 60 // = 14 days. ttl means "time to live" (expiration in seconds)
  }),

  // cookies settings
  cookie: {
    secure: false,  
    httpOnly: false, // if true, will disallow JavaScript from reading cookie data
    expires: new Date(Date.now() + 60 * 60 * 24 * 1000) // 1 hour;
  }
}))
// Passport Config
require('./config/passport')(passport); // pass passport for configuration
// Passport init (must be after establishing the session above)
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Pass 'req.user' as 'user' to ejs templates
// Just a custom middleware
app.use(function(req, res, next) {
res.locals.user = req.user || null;
// res.locals is an object available to ejs templates. for example: <%= user %>
next();
})



app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dataCenter', dataCenterRouter);
app.use('/os', osRouter);
app.use('/dataStorage', dataStorageRouter);
app.use('/cluster', clusterRouter);
app.use('/test', testRouter);
app.use('/client',clientRouter);
app.use('/auth',require('./routes/auth'))
app.use('/vm',vmRouter);
app.use('/realTime',dcDetails);
app.use('/admin',adminsRoute);
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
