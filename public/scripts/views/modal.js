define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'views/abstract/base',
  'text!templates/modal.Handlebars'
], function(_, Backbone, bSuper, Handlebars, BaseView, TPL) {

  'use strict';

  var Modal = BaseView.extend({

    el: 'body',

    events: {
      'click .btn-close': 'close',
      'touchstart .btn-close': 'close'
    },

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
      var $e = $(e.target);
      if($e.is(this.modal) || $e.is('.btn-close')) {
        this.modal.remove();
        this.off();
      }
    }

  });

  return Modal;

});
