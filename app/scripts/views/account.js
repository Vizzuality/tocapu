define([
  'backbone',
  'handlebars',
  'lib/quipu',
  'facade',
  'models/account',
  'text!templates/account.handlebars'
], function(Backbone, Handlebars, quipu, Facade, AccountModel, tpl) {

  'use strict';

  var AccountView = Backbone.View.extend({

    events: {
      'submit form': 'setAccount',
      'click #changeUsername': 'reset'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.model = new AccountModel();
      this.render();
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },

    setAccount: function(e) {
      e.preventDefault();
      this.model.set(quipu.serializeForm(e.currentTarget));
      Facade.set('accountName', this.model.get('username'));
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
