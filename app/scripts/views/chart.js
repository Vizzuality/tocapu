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
              x: fc.get('columnsName').x,
              rows: rows,
              hide: hiddenColumns,
              type: fc.get('graphType')
            },
            axis: {
              x: {
                label: fc.get('columnsName').x
              },
              y: {
                label: fc.get('columnsName').y
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

      if(fc.get('graphType') === 'scatter') {
        params.point = {
          r: function(d) {
            /* density is the 3rd element */
            return 2 * data.rows[d.index][2];
          }
        }
      }

      this.chart = c3.generate(params);
      return this;
    }

  });

  return ChartView;

});
