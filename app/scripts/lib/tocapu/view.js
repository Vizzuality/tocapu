define([
  'lib/tocapu/class'
], function(Class) {

  'use strict';

  var View = Class.extend({

    tagName: 'div',

    init: function() {
      if (!this.el) {
        this.setElement();
      }
    },

    setElement: function() {
      this.el = this.createElement(this.tagName);
    },

    createElement: function(tagName) {
      return document.createElement(tagName);
    }

  });

  return View;

});
