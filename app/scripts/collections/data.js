define([
  'underscore',
  'backbone',
  'facade'
], function(_, Backbone, Facade) {

  'use strict';

  var DataCollection = Backbone.Collection.extend({

    comparator: 'name',

    url: function() {
      return 'http://%1.cartodb.com/api/v2/sql'.format(Facade.get('accountName'));
    },

    parse: function(data) {
      var rows       = data.rows,
          tableData  = { columns: [], rows:    [] },
          chartData  = {};

      /* We initialize the tableData and chartData objects */
      _.each(Facade.get('columnsName') || {}, function(name) {
        tableData.columns.push(name);
        chartData[name] = (name === Facade.get('columnsName').x || name === Facade.get('columnsName').y) ? [name] : [];
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
