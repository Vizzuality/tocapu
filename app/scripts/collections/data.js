define([
  'underscore',
  'backbone'
], function(_, Backbone) {

  'use strict';

  var DataCollection = Backbone.Collection.extend({

    comparator: 'name',

    url: function() {
      if (!this.username) {
        throw 'username is a required param';
      }
      return 'http://%1.cartodb.com/api/v2/sql'.format(this.username);
    },

    parse: function(data) {
      return data;
    },

    setUsername: function(username) {
      this.username = username;
      return this;
    }

  });

  return DataCollection;

});
