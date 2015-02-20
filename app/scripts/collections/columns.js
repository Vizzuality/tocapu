define([
  'underscore',
  'backbone'
], function(_, Backbone) {

  'use strict';

  var ColumnsCollection = Backbone.Collection.extend({

    comparator: 'name',

    url: function() {
      if (!this.username) {
        throw 'username is a required param';
      }
      return 'http://%1.cartodb.com/api/v2/sql'.format(this.username);
    },

    parse: function(data) {
      var results = [];
      for (var c in data.fields) {
        if (data.fields.hasOwnProperty(c)) {
          results.push({ name: c, type: data.fields[c].type });
        }
      }
      return results;
    },

    setUsername: function(username) {
      this.username = username;
      return this;
    }

  });

  return ColumnsCollection;

});
