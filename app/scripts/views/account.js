define([
  'tocapu',
  'ejs',
  'text!templates/account.html'
], function(Tocapu, EJSLib, tpl) {

  'use strict';

  var AccountView = Tocapu.View.extend({

    template: Tocapu.utils.template(tpl),

    init: function(settings) {
      this.el = settings.el;
      Tocapu.View.prototype.init.apply(this);
    },

    render: function() {
      this.el.html(this.template());
      return this;
    }

  });

  return AccountView;

});
