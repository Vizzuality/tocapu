define([
  'underscore',
  'backbone',
  'facade'
], function(_, Backbone, fc) {

  'use strict';

  var DataCollection = Backbone.Collection.extend({

    comparator: 'name',

    url: function() {
      return 'http://%1.cartodb.com/api/v2/sql'.format(fc.get('accountName'));
    },

    parse: function(data) {
      var rows       = data.rows,
          tableData  = { columns: [], rows:    [] },
          chartData  = {};

      /* We initialize the tableData and chartData objects */
      _.each(fc.get('columnsName') || {}, function(name) {
        var columnName = name === fc.get('columnsName').x ||
          name === fc.get('columnsName').y;
        tableData.columns.push(name);
        chartData[name] = (columnName) ? [name] : [];
      });

      /* We actually parse the data */
      _.each(rows || [], function(data) {
        var tableRow = [];
        _.each(data, function(value, key) {
          tableRow.push(value);
          chartData[key].push(value);
        });
        tableData.rows.push(tableRow);
      });

      return { tableData: tableData, chartData: chartData };
    },

  });

  return DataCollection;

});
