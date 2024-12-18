var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const MongoStore = require('connect-mongo');
var cors = require('cors')

var userRouter = require('./routes/user');
const db = require('./config/connection')
var session = require('express-session')
var app = express();

app.use(cors({
  origin: 'https://king-atm.onrender.com', // Allow frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Fixed typo from 'Contend-Type' to 'Content-Type'
  credentials: true // Allow credentials (cookies/sessions)
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



const sessionMiddleware = session({
  secret: 'ajinajinshoppingsecretisajin',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb+srv://ajinrajeshhillten:Zlkkf73UtUnnZBbU@bank.x6s92.mongodb.net/?retryWrites=true&w=majority&appName=bank',
    collectionName: 'sessions',
    ttl: 24 * 60 * 60, // Session TTL (1 day)
    autoRemove: 'native',
    touchAfter: 24 * 3600 // Time period in seconds between session updates
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
});
// Add this before your routes
app.set('trust proxy', 1);
app.use(sessionMiddleware);


app.use('/', userRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



db.connect((err) => {
  if (err) {
    console.log('Database Not connected ', err);
  } else {
    console.log('DataBase Connected ');

  }
})

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
