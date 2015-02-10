define([
  'classjs'
], function(Class) {

  'use strict';

  var AccountView = Class.extend({

    init: function(settings) {
      this.el = settings.el;
    },

    render: function() {
      return this;
    }

  });

  return AccountView;

});
