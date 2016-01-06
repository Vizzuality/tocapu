define([
  'underscore',
  'backbone',
  'backbone-super',
  'views/abstract/base',
  'views/abstract/input',
  'facade',
  'helpers/utils',
  'text!templates/account.handlebars'
], function(_, Backbone, bSuper, BaseView, InputView, fc, Utils, TPL) {

  'use strict';

  var AccountView = BaseView.extend({

    events: {
      'submit form': 'onSubmit',
      'click #changeUsername': 'reset'
    },

    template: TPL,

    initialize: function() {
      var inputView = new (InputView.extend({
        el: '.username',
        template: '<label for="username">Username' +
          '{{#if error}}{{{error}}}{{/if}}' +
          '<input type="text" name="username" placeholder="username" required' +
          ' value="{{value}}">' +
          '</label>'
      }))();
      this.addView({ inputView: inputView });
    },

    serialize: function() {
      if(this.error) { return { error: this.error }; }
      else if(this.username) { return { username: this.username }; }
      else { return {}; }
    },

    /**
     * Sets the facade's account and logins
     * @param  {Object} e the submit event
     */
    onSubmit: function(e) {
      e.preventDefault();
      fc.set('account', this.views.inputView.get('value'));
      this.login(fc.get('account'));
    },

    /**
     * Tries to connect to CartoDB to verify that the username is right. If so,
     * trigger an 'account:change' event and sets the facade's account variable,
     * otherwise, renders an error
     * @param  {String} username
     */
    login: function(username) {
      this.$el.addClass('is-loading');
      $.ajax(Utils.formatEndPoint(username, 'select null'))
        .done(_.bind(function() {
          fc.set('account', username);
          this.username = username;
          this.error = undefined;
          this.render();
          this.appEvents.trigger('route:update');
          this.appEvents.trigger('account:change');
        }, this))
        .fail(_.bind(function() {
          this.error = 'Unable to connect using this username';
          this.username = undefined;
          this.render();
        }, this))
        .always(_.bind(function() {
          this.$el.removeClass('is-loading');
        }, this));
    },

    reset: function(e) {
      e.preventDefault();
      this.username = undefined;
      this.views.inputView.set({ value: undefined });
      fc.unset('account');
      this.appEvents.trigger('route:update');
      this.appEvents.trigger('account:reset');
      this.render();
    },

    /**
     * Restores the state of the view
     * Note: will actally work once, supposed to be when the view is rendered
     * for the first time
     */
    restore: _.once(function() {
      if(fc.get('account')) {
        this.views.inputView.set({ value: fc.get('account') });
        this.login(fc.get('account'));
      }
    }),

    afterRender: function() {
      this.restore();
    }

  });

  return AccountView;

});
