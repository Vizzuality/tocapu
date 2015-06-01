define([
  'underscore',
  'backbone',
  'facade',
  'helpers/utils'
], function(_, Backbone, fc, Utils) {

  'use strict';

  var DataCollection = Backbone.Collection.extend({

    comparator: 'name',

    url: function() {
      return Utils.getEndPoint(fc.get('account'));
    },

    initialize: function() {
      this.error = undefined;
      this.on('error', function(self, res) {
        this.error = 'Unable to load the data from CartoDB: '+res.statusText;
      }, this);
    },

    parse: function(data) {
      var rows        = data.rows,
          parsedData  = { columns: [], rows: [] };

      /* We initialize the parsedData object */
      _.each(rows[0] || [], function(value, columnName) {
        var axis; /* Stores the axis' name if it is an axis,
                     undefined otherwise */
        if(columnName === fc.get('x')) {
          axis = 'x';
        }
        else if(columnName === fc.get('y')) {
          axis = 'y';
        }

        parsedData.columns.push({
          axis: axis,
          name: columnName
        });
      });

      /* We actually parse the data */
      _.each(rows || [], function(data) {
        var parsedDataRows = [];
        _.each(data, function(value) { parsedDataRows.push(value); });
        parsedData.rows.push(parsedDataRows);
      });

      return parsedData;
    }

  });

  return DataCollection;

});
