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
      // Stores the names of the columns whose data type is date
      var dateColumns  = [];

      /* We initialize the parsedData object */
      _.each(data.fields || {}, function(o, columnName) {
        var axis; /* Stores the axis' name if it is an axis,
                     undefined otherwise */
        if(columnName === fc.get('x')) { axis = 'x'; }
        else if(columnName === fc.get('y')) { axis = 'y'; }

        if(o.type === 'date') { dateColumns.push(columnName); }

        parsedData.columns.push({
          axis: axis,
          name: columnName,
          type: o.type
        });
      });

      /* We actually parse the data */
      _.each(rows || [], function(data) {
        var parsedDataRows = [];
        _.each(data, function(value, columnName) {
          if(dateColumns.indexOf(columnName) !== -1) {
            parsedDataRows.push(new Date(value));
          }
          else {
            parsedDataRows.push(value);
          }
        });
        parsedData.rows.push(parsedDataRows);
      });

      return parsedData;
    }

  });

  return DataCollection;

});
