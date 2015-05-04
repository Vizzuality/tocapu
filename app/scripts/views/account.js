define([
  'underscore',
  'backbone',
  'handlebars',
  'lib/quipu',
  'facade',
  'models/account',
  'text!templates/account.handlebars'
], function(_, Backbone, Handlebars, quipu, fc, AccountModel, tpl) {

  'use strict';

  var AccountView = Backbone.View.extend({

    events: {
      'submit form': 'parseForm',
      'click #changeUsername': 'reset'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.model = new AccountModel();

      this.render();

      Backbone.Events.on('account:success', this.render, this);
      Backbone.Events.on('account:error', this.renderError, this);
    },

    /**
     * Renders the view if not an embedded one
     * @return {Object} Backbone.View
     */
    render: function() {
      if(!fc.get('isEmbed')) {
        this.$el.html(this.template(this.model.attributes));
      }
      return this;
    },

    /**
     * Renders the view with an error message
     */
    renderError: function() {
      this.model.unset('username');
      fc.unset('account');

      Backbone.Events.trigger('route:reset');
      this.$el.html(this.template({ error: true }));

      return this;
    },

    /**
     * Parses the form to get the account's name
     * @param  {Object} e the submit event
     */
    parseForm: function(e) {
      e.preventDefault();
      fc.set('account', quipu.serializeForm(e.currentTarget).username);
      this.setAccount(true);
    },

    /**
     * Sets the account's username
     * @param {Boolean} updateUrl if true updates the URL
     */
    setAccount: function(updateUrl) {
      this.model.set({ username: fc.get('account') });
      Backbone.Events.trigger('account:change');
      if(updateUrl) { Backbone.Events.trigger('route:update'); }
      this.$el.addClass('is-submited');
    },

    /**
     * Returns the account's name from the model
     * @return {String} the account's name
     */
    getAccountName: function() {
      return this.model.get('username');
    },

    /**
     * Resets the view and triggers an account:reset event
     * @return {[type]} [description]
     */
    reset: function() {
      this.model.clear();
      this.render();
      Backbone.Events.trigger('account:reset');
    }

  });

  return AccountView;

});
