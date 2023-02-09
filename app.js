var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);


var app = express();

app.use(session({ secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({path: './sessions'}),
    cookie: { maxAge: 3600000, secure: false, httpOnly: false }
  })
);

// view engine setup
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'pages')]);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'files/uploads')));
app.use('/posts', express.static(path.join(__dirname, 'files/posts')));


require('./routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).send('Not found');
    console.log(createError(404));
  //next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
