define([
  'underscore',
  'backbone',
  'helpers/utils',
  'facade'
], function(_, Backbone, Utils, fc) {

  'use strict';

  var QueryColumnsCollection = Backbone.Collection.extend({

    comparator: 'name',

    url: function() {
      return Utils.getEndPoint(fc.get('account'));
    },

    parse: function(data) {
      var results = [];
      for (var c in data.fields) {
        if (data.fields.hasOwnProperty(c)) {
          results.push({ name: c, type: data.fields[c].type });
        }
      }
      return results;
    }

  });

  return QueryColumnsCollection;

});
