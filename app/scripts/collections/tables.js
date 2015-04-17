define([
  'backbone',
  'fc'
], function(Backbone, fc) {

  'use strict';

  var TablesCollection = Backbone.Collection.extend({

    comparator: 'cdb_usertables',

    url: function() {
      return 'http://%1.cartodb.com/api/v2/sql'.format(fc.get('accountName'));
    },

    parse: function(data) {
      return data.rows;
    }

  });

  return TablesCollection;

});
