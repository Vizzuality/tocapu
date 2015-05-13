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
      this.collection.on('sync', this.render, this);
    },

    /**
     * Computes the min and max values of the array arg
     * @param  {Array} rows the data values [ 1, 2, 3, ... ], each element has
     *                      to be numerical
     * @return {Array} [min, max]
     */
    minMax: function(rows) {
      if(!(rows instanceof Array)) {
        throw new TypeError();
      }

      var range = [undefined, undefined];

      _.each(rows, function(value) {
        if(typeof value !== 'number') {
          throw new TypeError();
        }

        /* We compute the min value */
        if(range[0] === undefined) { range[0] = value; }
        else if(value < range[0]) { range[0] = value; }

        /* We compute the max value */
        if(range[1] === undefined) { range[1] = value; }
        else if(value > range[1]) { range[1] = value; }
      });

      return range;
    },

    /**
     * Renders the chart
     * @param  {Object} collection Backbone.Collection
     * @return {Object} the view itself
     */
    render: function(collection) {
      var data = Utils.extractData(collection);
      var columnsName = _.map(data.columns, function(column) {
            return column.name;
          }),

         rows = data.rows ? [columnsName].concat(data.rows) : [columnsName],

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
            subchart: {
                show: true
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

      if(fc.get('graph') === 'scatter') { /* TODO if !data.rows? */
        var dotSize = d3.scale.linear() /* TODO !d[2] */
          .domain(this.minMax(_.map(data.rows, function(d) {
            return d[2];
          })))
          .range(Config.dotSizeRange);

        params.point = {
          r: function(d) { return dotSize(data.rows[d.index][2]); }
        };
      }

      this.chart = c3.generate(params);
      return this;
    }

  });

  return ChartView;

});
