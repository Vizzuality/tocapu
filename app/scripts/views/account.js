define([
  'd3',
  'tocapu',
  'text!templates/account.html'
], function(d3, Tocapu, tpl) {

  'use strict';

  var AccountView = Tocapu.View.extend({

    template: tpl,

    init: function(settings) {
      this.el = settings.el;
      Tocapu.View.prototype.init.apply(this, arguments);
      this.render();
    },

    setListeners: function() {
      d3.select('form').on('submit', this.onSubmit);
    },

    render: function() {
      this.el.html(this.template);
      return this;
    },

    onSubmit: function() {
      d3.event.preventDefault();
      console.log(d3.event.target);
      var params = Tocapu.utils.serializeForm(d3.event.target);
      console.log(params);
    }

  });

  return AccountView;

});
