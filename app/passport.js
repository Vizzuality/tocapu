'use strict';

import User from './models/user';
import {Strategy} from 'passport-local';

export default function (passport) {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });

  /**
   * SIGN UP:
   * We are using named strategies
   * since we have one for login and one for signup
   * by default, if there was no name, it would just be called 'local'.
   */
  passport.use('local-signup', new Strategy({
    // By default, local strategy uses username and password,
    // we will override with email.
    usernameField: 'email',
    passwordField: 'password',
    // Allows us to pass back the entire request to the callback.
    passReqToCallback: true
  }, (req, email, password, done) => {
    // Asynchronous: User.findOne wont fire unless data is sent back.
    process.nextTick(() => {
      // Find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists.
      User.findOne({email}, (err, user) => {
        // if there are any errors, return the error
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }
        // If there is no user with that email create the user
        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.generateHash(password);
        // save the user
        newUser.save(err => {
          if (err) {
            return done(null, false, req.flash('signupMessage', err.message));
          }
          return done(null, newUser);
        });
      });
    });
  }));

  /**
   * LOGIN:
   * We are using named strategies
   * since we have one for login and one for signup
   * by default, if there was no name, it would just be called 'local'.
   */
  passport.use('local-login', new Strategy({
    // By default, local strategy uses username and password,
    // we will override with email.
    usernameField: 'email',
    passwordField: 'password',
    // Allows us to pass back the entire request to the callback.
    passReqToCallback: true
  }, (req, email, password, done) => {
    // Find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    User.findOne({email}, (err, user) => {
      // if there are any errors, return the error before anything else
      if (err) {
        return done(err);
      }
      // if no user is found, return the message
      if (!user) {
        // req.flash is the way to set flashdata using connect-flash
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }
      // if the user is found but the password is wrong
      if (!user.validPassword(password)) {
        // create the loginMessage and save it to session as flashdata
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
      }
      // all is well, return successful user
      return done(null, user);
    });
  }));
}
