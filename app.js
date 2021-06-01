const express = require('express');
const exphbs = require('express-handlebars');
const favicon = require('serve-favicon');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use('/', indexRouter);

module.exports = app;
