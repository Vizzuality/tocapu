define([
  'backbone',
  'handlebars',
  'lib/quipu',
  'models/account',
  'text!templates/account.handlebars'
], function(Backbone, Handlebars, quipu, AccountModel, tpl) {

  'use strict';

  var AccountView = Backbone.View.extend({

    events: {
      'submit form': 'setAccount',
      'click #changeUsername': 'reset'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.model = new AccountModel();
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },

    setAccount: function(e) {
      e.preventDefault();
      this.model.set(quipu.serializeForm(e.currentTarget));
      this.$el.addClass('is-submited');
      this.render();
    },

    reset: function() {
      this.model.clear();
      this.render();
    }

  });

  return AccountView;

});
