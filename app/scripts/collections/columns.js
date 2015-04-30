define([
  'underscore',
  'backbone',
  'facade'
], function(_, Backbone, fc) {

  'use strict';

  var ColumnsCollection = Backbone.Collection.extend({

    comparator: 'name',

    url: function() {
      return 'http://%1.cartodb.com/api/v2/sql'.format(fc.get('account'));
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

  return ColumnsCollection;

});
