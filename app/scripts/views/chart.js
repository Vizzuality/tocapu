define([
  'underscore',
  'backbone',
  'facade',
  'helpers/utils',
  'd3',
  'c3'
], function(_, Backbone, fc, Utils, d3, c3) {

  'use strict';

  var ChartView = Backbone.View.extend({

    el: '#chartView',

    initialize: function() {
      this.collection.on('sync', _.bind(this.render, this));
    },

    render: function(collection) {
      var data = Utils.extractData(collection),

          columnsName = _.map(data.columns, function(column) {
            return column.name;
          }),

          rows = [columnsName].concat(data.rows),

          hiddenColumns = _.difference(columnsName,
            _.values(fc.get('columnsName'))),

          params = {
            bindto: this.el,
            data: {
              x: fc.get('x'),
              rows: rows,
              hide: hiddenColumns,
              type: fc.get('graph')
            },
            axis: {
              x: {
                label: fc.get('x')
              },
              y: {
                label: fc.get('y')
              }
            },
            legend: {
              hide: true
            },
            size: {
              width: this.$el.innerWidth(),
              height: 400
            }
          };

      if(fc.get('graph') === 'scatter') {
        params.point = {
          r: function(d) {
            /* density is the 3rd element */
            return 2 * data.rows[d.index][2];
          }
        };
      }

      this.chart = c3.generate(params);
      return this;
    }

  });

  return ChartView;

});
