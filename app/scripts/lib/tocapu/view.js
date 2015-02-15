define([
  'lib/tocapu/utils',
  'lib/tocapu/class'
], function(utils, Class) {

  'use strict';

  var View = Class.extend({

    tagName: 'div',

    init: function() {
      this.setElement();
    },

    setElement: function() {
      if (!this.el) {
        this.el = this.createElement(this.tagName);
      }
    },

    createElement: function(tagName) {
      return document.createElement(tagName);
    },

    render: function() {
      return this;
    }

  });

  return View;

});
