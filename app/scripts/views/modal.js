define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'text!templates/modal.Handlebars'
], function(_, Backbone, bSuper, Handlebars, TPL) {

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

    /**
     * Closes the modal by deleting it from the DOM
     * @param  {Object} e the event associated to the user's click
     */
    close: function(e) {
      if($(e.target).is(this.modal)) {
        this.modal.remove();
      }
    }

  });

  return Modal;

});
