define([
  'backbone',
  'underscore',
  'facade',
  'helpers/utils'
], function(Backbone, _, fc, Utils) {

  'use strict';

  var QueryTablesCollection = Backbone.Collection.extend({

    comparator: 'name',

    url: function() {
      return Utils.getEndPoint(fc.get('account'));
    },

    parse: function(data) {
      return _.map(data.rows, function(o) {
        return { name: _.values(o)[0] };
      });
    }

  });

  return QueryTablesCollection;

});
