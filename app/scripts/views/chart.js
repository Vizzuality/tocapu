define([
  'underscore',
  'backbone',
  'backbone-super',
  'facade',
  'config',
  'helpers/utils',
  'views/abstract/base',
  'd3',
  'c3'
], function(_, Backbone, bSuper, fc, Config, Utils, BaseView, d3, c3) {

  'use strict';

  var ChartView = BaseView.extend({

    el: '#chartView',

    template: '{{#if error}}<p>{{{error}}}</p>{{/if}}',

    initialize: function() {
      this.collection.on('sync error', this.render, this);
      this.collection.on('request', function() {
        $('.l-chart').addClass('is-loading');
      });
      this.on('error', function(err) {
        this.error = err;
        this.render();
      }, this);
    },

    serialize: function() {
      var error = this.error || this.collection.error || undefined;
      if(error) {
        return { error: error };
      }
      return {};
    },

    renderChart: function() {
      var data = Utils.extractData(this.collection);
      var columnsName = _.map(data.columns, function(column) {
            return column.name;
      });
      var rows = data.rows ? [columnsName].concat(data.rows) : [columnsName];
      var hiddenColumns = _.difference(columnsName,
        [fc.get('x'), fc.get('y')]);
      var params = {
        bindto: this.$el.selector,
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

    afterRender: function() {
      /* Checking this.collection.length unables to make sure the chart won't
         be rendered when the view is rendered before the collection is
         fetched */
      if(!this.collection.error && this.collection.length > 0) {
        this.renderChart();
      }

      $('.l-chart').removeClass('is-loading');
    }

  });

  return ChartView;

});
