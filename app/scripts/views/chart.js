define([
  'underscore',
  'backbone',
  'facade',
  'config',
  'helpers/utils',
  'd3',
  'c3'
], function(_, Backbone, fc, Config, Utils, d3, c3) {

  'use strict';

  var ChartView = Backbone.View.extend({

    el: '#chartView',

    initialize: function() {
      this.collection.on('sync', _.bind(function(collection) {
        this.data = Utils.extractData(collection);
        this.render();
      }, this));
    },

    /**
     * Computes the min and max values of the density column
     * @return {Array} [min, max]
     */
    computeDensityRange: function() {
      var range = [undefined, undefined];

      _.each(this.data.rows, function(values) {
        if(values[2]) {
          /* We compute the min value */
          if(range[0] === undefined) { range[0] = values[2]; }
          else if(values[2] < range[0]) { range[0] = values[2]; }

          /* We compute the max value */
          if(range[1] === undefined) { range[1] = values[2]; }
          else if(values[2] > range[1]) { range[1] = values[2]; }
        }
      });

      return range;
    },

    /**
     * Renders the chart
     * @return {Object} the view itself
     */
    render: function() {
      var columnsName = _.map(this.data.columns, function(column) {
            return column.name;
          }),

         rows = [columnsName].concat(this.data.rows),

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
        var dotSize = d3.scale.linear()
          .domain(this.computeDensityRange())
          .range(Config.dotSizeRange);

        var self = this;

        params.point = {
          r: function(d) { return dotSize(self.data.rows[d.index][2]); }
        };
      }

      this.chart = c3.generate(params);
      return this;
    }

  });

  return ChartView;

});
