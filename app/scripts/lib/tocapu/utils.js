define([], function() {

  var array = [];
  var slice = array.slice;

  var utils = function() {

    String.prototype.format = function() {
      var args = [].slice.call(arguments),
        result = this.slice(),
        regexp;
      for (var i = args.length; i--;) {
        regexp = new RegExp('%' + (i + 1), 'g')
        result = result.replace(regexp, args[i]);
      }
      return result;
    };

    return {

      extend: function(obj) {
        slice.call(arguments, 1).forEach(function(item) {
          for (var key in item) obj[key] = item[key];
        });
        return obj;
      },

      serializeForm: function(form) {
        var elems = form.elements;
        var serialized = {};

        for(var i = 0, len = elems.length; i < len; i += 1) {
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

  };

  return utils();

});
