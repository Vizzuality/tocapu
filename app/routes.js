'use strict';

import csrf from 'csurf';
import authController from './controllers/auth_controller';

const csrfProtection = csrf({cookie: true});

/**
 * Route middleware to make sure a user is logged in
 */
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }
  // if they aren't redirect them to the home page
  res.redirect('/');
}

export default function (app, passport) {
  // User session
  app.get('/login', csrfProtection, authController.login);
  app.get('/signup', csrfProtection, authController.signup);
  app.get('/logout', authController.logout);

  // User authentication
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/signup',
    failureFlash: true
  }));
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/dashboard',
    failureRedirect : '/login',
    failureFlash : true
  }));

  // Welcome
  app.get('/', (req, res) => {
    res.send('welcome');
  });

  // Dashboard
  app.get('/dashboard', isLoggedIn, (req, res) => {
    res.send('dashboard');
  });
}
