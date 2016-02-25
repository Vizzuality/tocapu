'use strict';

export default {

  /**
   * Show form for user login.
   * If user is logged we will redirect him to dashboard page.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  login: (req, res) => {
    if (req.isAuthenticated()) {
      return res.redirect('/dashboard');
    }
    res.render('auth/login', {
      csrfToken: req.csrfToken(),
      message: req.flash('loginMessage')
    });
  },

  /**
   * Show form for user registration.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  signup: (req, res) => {
    res.render('auth/signup', {
      csrfToken: req.csrfToken(),
      message: req.flash('signupMessage')
    });
  },

  /**
   * Remove user session and redirect to welcome page.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  logout: (req, res) => {
    req.logout();
    res.redirect('/');
  }

};
