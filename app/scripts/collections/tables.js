define([
  'backbone'
], function(Backbone) {

  'use strict';

  var TablesCollection = Backbone.Collection.extend({

    comparator: 'cdb_usertables',

    url: function() {
      return 'http://%1.cartodb.com/api/v2/sql'.format(this.username);
    },

    parse: function(data) {
      return data.rows;
    },

    setUsername: function(username) {
      this.username = username;
      return this;
    }

  });

  return TablesCollection;

});
