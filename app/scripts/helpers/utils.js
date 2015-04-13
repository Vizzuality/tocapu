define(function() {

  'use strict';

  var Utils = {

    extractData: function(collection) {
      return (collection.toJSON().length > 0) ? collection.toJSON()[0] : {};
    }

  };

  return Utils;

});
