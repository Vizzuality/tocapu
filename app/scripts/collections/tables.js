define([
  'backbone',
  'facade'
], function(Backbone, Facade) {

  'use strict';

  var TablesCollection = Backbone.Collection.extend({

    comparator: 'cdb_usertables',

    url: function() {
      return 'http://%1.cartodb.com/api/v2/sql'.format(Facade.get('accountName'));
    },

    parse: function(data) {
      return data.rows;
    }

  });

  return TablesCollection;

});
