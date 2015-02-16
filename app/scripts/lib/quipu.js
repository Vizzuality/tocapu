define(['jquery'], function($) {

  'use strict';

  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = [].slice.call(arguments),
        result = this.slice(),
        regexp;
      for (var i = args.length; i--;) {
        regexp = new RegExp('%' + (i + 1), 'g');
        result = result.replace(regexp, args[i]);
      }
      return result;
    };
  }

  $.fn.addClass = function(className) {
    for (var i = this.length; i--;) {
      this[i].classList.add(className);
    }
    return this;
  };

  return {

    serializeForm: function(form) {
      var elems = form.elements;
      var serialized = {};

      for(var i = elems.length; i--;) {
        var element = elems[i];
        var name = element.name;
        var value = element.value;
        if (name !== '') {
          serialized[name] = value;
        }
      }

      return serialized;
    }

  };

});
