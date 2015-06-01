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

      var axis = {
        x: _.findWhere(data.columns, { axis: 'x'}),
        y: _.findWhere(data.columns, { axis: 'y'})
      };

      /* In the case of date data type, we need to make some adjustements to the
         axis ticks */
      _.each(axis, function(o, name) {
        if(o.type === 'date') {
           var interval = d3.extent(_.map(data.rows, function(d) {
            return d[name === 'x' ? 0 : 1];
          }));
          params.axis[name].type = 'timeseries';
          params.axis[name].tick = {
            format: this.dateFormat(name, interval),
            fit: false /* Makes the space equal between each tick */
          };
        }
      }, this);

      if(fc.get('graph') === 'scatter') { /* TODO if !data.rows? */
        var dotSize = d3.scale.linear() /* TODO !d[2] */
          .domain(d3.extent(_.map(data.rows, function(d) {
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
     * Returns the ticks' date format of an axis
     * @param  {String} axisName the name of the axis (x or y)
     * @param  {Array}  interval array of the two extreme dates
     * @return {String}          the D3 date format
     */
    dateFormat: function(axisName, interval) {
      /* Difference in seconds */
      var diff = (interval[1].getTime() - interval[0].getTime()) / 1000;
      var format = '%Y'; /* Default for multi-year data */

      if(diff / (3600 * 24) < 1) { /* Less than a day */
        format = '%H:%M';
      }
       else if(diff / (3600 * 24 * 31) < 1) { /* Less than a week */
        format = '%a %I%p';
      }
      else if(diff / (3600 * 24 * 31) < 1) { /* Less than a month */
        format = '%a %d';
      }
      else if(diff / (3600 * 24 * 365) < 1) { /* Less than a year */
        format = '%b';
      }
      return format;
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
