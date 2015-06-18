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

    scatterOptions: {
      data: {
        type: 'scatter'
      },
      subchart: {
          show: false
      },
      legend: {
        hide: true
      },
      size: {
        width:  400,
        height: 200
      }
    },

    pieOptions: {
      data: {
        type: 'pie'
      },
      size: {
        width:  400,
        height: 200
      }
    },

    byCategoryOptions: {
      data: {
        type: 'bar'
      },
      tooltip: {
        grouped: false
      },
      size: {
        width:  400,
        height: 200
      }
    },

    initialize: function() {
      this.collection.on('sync', this.render, this);
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

    /**
     * Renders the chart
     */
    renderChart: function() {
      if(this.chart) {
        this.chart.destroy();
        delete this.chart;
      }
      var params;
      switch(fc.get('graph')) {
        case 'pie':
          params = this.getPieParams();
          break;
        case 'byCategory':
          params = this.getByCategoryParams();
          break;
        default: /* Scatter */
          params = this.getScatterParams();
          break;
      }

      this.chart = c3.generate(params);
    },

    /**
     * Returns the params for the pie chart
     * @return {Object} the params
     */
    getPieParams: function() {
      var data = Utils.extractData(this.collection);

      /* To avoid showing thousands of categories, we group all of them which
         represent less than .5% under a same categorie called 'Other' */
      var sum = _.reduce(data.rows, function(memo, values) {
        return memo + values[1]; /* values[1] is 'occurencies' */
      }, 0);
      var groupedData = _.groupBy(data.rows, function(values) {
        return values[1] * 200 < sum;
      });
      var relevantRows = groupedData.false;
      var sumOther = _.reduce(groupedData.true, function(memo, values) {
        return memo + values[1];
      }, 0);
      /* We concatenate the relevant rows with a row formed of the irrelevant
         ones (the sum of their occurencies) */
      if(sumOther > 0) {
        data.rows = relevantRows.concat([['Other', sumOther]]);
      }

      var params = {
        bindto: this.$el.selector,
        data: {
          columns: data.rows
        },
        size: {
          width:  this.getWidth(),
          height: this.getHeight()
        }
      };

      return $.extend(true, $.extend(true, {}, this.pieOptions), params);
    },

    /**
     * Returns the params for the 'by category' chart
     * @return {Object} the params
     */
    getByCategoryParams: function() {
      var data = Utils.extractData(this.collection);
      var params = {
        bindto: this.$el.selector,
        data: {
          columns: data.rows
        },
        size: {
          width:  this.getWidth(),
          height: this.getHeight()
        }
      };
      return $.extend(true, $.extend(true, {}, this.byCategoryOptions), params);
    },

    /**
     * Returns the params for the scatter chart
     * @return {Object} the params
     */
    getScatterParams: function() {
      var data = Utils.extractData(this.collection);
      var columnsName = _.map(data.columns, function(column) {
            return column.name;
      });
      var hiddenColumns = _.difference(columnsName,
        [fc.get('x'), fc.get('y')]);
      /* We get the position of the columns with a date data type */
      var dateAxis = _.filter(data.columns, function(column) {
        return column.type === 'date';
      }).map(function(column) { return column.axis === 'x' ? 0 : 1; });

      /* We copy the rows into a local variable and transform the values of ones
         which are Date object to numbers */
      var rows = [];
      _.each(data.rows, function(row) {
        var r = [];
        for(var i = 0; i < row.length; i++) {
          if(dateAxis.indexOf(i) !== -1) {
            r.push(row[i].getTime());
          }
          else {
            r.push(row[i]);
          }
        }
        rows.push(r);
      });
      rows = rows ? [columnsName].concat(rows) : [columnsName];

      var params = {
        bindto: this.$el.selector,
        data: {
          x:    fc.get('x'),
          rows: rows,
          hide: hiddenColumns
        },
        axis: {
          x: {
            label: fc.get('x')
          },
          y: {
            label: fc.get('y')
          }
        },
        size: {
          width:  this.getWidth(),
          height: this.getHeight()
        }
      };

      /* For the timeseries, we update the params and generate the labels of the
         ticks */
      for(var i = 0; i < dateAxis.length; i++) {
        var domain = d3.extent(_.map(data.rows, function(d) {
          return d[dateAxis[i]];
        }));
        var range = [domain[0].getTime(), domain[1].getTime()];
        var scale = d3.time.scale().domain(domain).range(range);
        var axis = (dateAxis[i] === 0) ? 'x' : 'y';
        var interval = (range[1] - range[0]) / 1000;
        var format = this.dateFormat(interval);
        params.axis[axis].tick = {
          culling: false,
          count: (axis === 'x') ? Math.round(this.getWidth() / 50) :
            Math.round(this.getHeight() / 20),
          format: function(x) { return format(scale.invert(x)); }
        };
      }

      /* We dynamically create the size of the dots */
      var dotSize = d3.scale.linear() /* TODO !d[2] */
        .domain(d3.extent(_.map(data.rows, function(d) {
          return d[2];
        })))
        .range(Config.dotSizeRange);
      params.point = {
        r: function(d) { return dotSize(data.rows[d.index][2]); }
      };

      return $.extend(true, $.extend(true, {}, this.scatterOptions), params);
    },

    /**
     * Returns the date format of the chart's ticks
     * @param  {Number}   the second-based range interval
     * @return {Function} the d3 format function
     */
    dateFormat: function(interval) {
      return d3.time.format.multi([
        ['%a %I%p', function() { return interval / (3600 * 24) < 1; }],
        /* Less than a week: day name hour */
        ['%a %I%p', function() { return interval / (3600 * 24 * 31) < 1; }],
        /* Less than a month: day name day */
        ['%a %d', function() { return interval / (3600 * 24 * 31) < 1; }],
        /* Less than 4 month: month day */
        ['%b %d', function() { return interval / (3600 * 24 * 31) < 4; }],
        /* Less than a year: month */
        ['%B', function() { return interval / (3600 * 24 * 365) < 1; }],
        /* Otherwise: year */
        ['%Y', function() { return true; }]
      ]);
    },

    /**
     * Returns the maximum with the graph can take
     * @return {Number} the width
     */
    getWidth: function() {
      return this.$el.innerWidth();
    },

    /**
     * Returns the maximum height the graph can take
     * @return {Number} the height
     */
    getHeight: function() {
      return window.innerHeight - $('.l-nav').innerHeight() -
             $('.l-table').innerHeight() -
             $('.l-chart .row:first-child').innerHeight();
    },

    afterRender: function() {
      /* Checking this.collection.length to make sure the chart won't
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
