define([
  'underscore',
  'backbone',
  'handlebars',
  'text!templates/modal.Handlebars'
], function(_, Backbone, Handlebars, TPL) {

  'use strict';

  var Modal = Backbone.View.extend({

    el: 'body',

    template: Handlebars.compile(TPL),

    initialize: function(options) {
      this.options = options || {};
      this.render();

      this.modal = this.$el.find('#modal');

      this.setListeners();
    },

    setListeners: function() {
      this.modal.on('click', _.bind(this.close, this));
    },

    render: function() {
      this.$el.append(this.template(this.options));

      return this;
    },

    close: function(e) {
      if($(e.target).is(this.modal)) {
        this.modal.remove();
      }
    }

  });

  return Modal;

});
