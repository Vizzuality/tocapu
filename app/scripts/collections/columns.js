define([
  'backbone',
  ''
], function(Backbone) {

  'use strict';

  var ColumnsCollection = Backbone.Collection.extend({

    url: function() {
      if (!this.username) {
        throw 'username is a required param';
      }
      return 'http://%1.cartodb.com/api/v2/sql'.format(this.username);
    },

    parse: function(data) {
      console.log(data);
      return data.rows;
    },

    setUsername: function(username) {
      this.username = username;
      return this;
    }

  });

  return ColumnsCollection;

});
