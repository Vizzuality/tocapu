'use strict';

import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';

import routes from './routes';
import passportConfig from './passport';

const app = express();

// Setting passport configuration before initializing
passportConfig(passport);

// Application configuration
app.use(logger('dev'));
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'mysecretword',
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Importing routes
routes(app, passport);

export default app;
