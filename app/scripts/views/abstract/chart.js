/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'backbone-super',
  'd3',
  'views/abstract/base'
], function(_, Backbone, bSuper, d3, BaseView) {

  'use strict';

  var ChartView = BaseView.extend({

    defaults: {
      width: 500,
      height: 400,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: {
        height: 20,
        timeserie: false,
        tickFormat: null,
        tickCount: null
      },
      yAxis: {
        width: 37,
        showLabel: false,
        showGrid: false,
        tickFormat: null,
        label: {
          height: 20
        }
      },
      point: {
        type: null,
        size: 0
      },
      showTrail: false,
      colorCount: 6, /* Number of colors used that could be used by the chart */
      legend: {
        height: 20
      }
    },

    initialize: function(options) {
      this.options = $.extend(true, $.extend(true, {}, this.defaults),
        options || {});
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.$el.append(this.svg);
      this.setElement(this.svg);
      this.render();
    },

    /**
     * Generates the chart into the SVG element (this.svg)
     */
    render: function() {},

    /**
     * Returns the width available inside the SVG element
     * @return {Number}
     */
    getInnerWidth: function() {
      return this.options.width - this.options.padding.right -
        this.options.padding.left;
    },

    /**
     * Returns the height available inside the SVG element
     * @return {Number}
     */
    getInnerHeight: function() {
      return this.options.height - this.options.padding.top -
        this.options.padding.bottom;
    },

    /**
     * Returns the number of times a number can by divided by 1000
     * @param  {Number} number
     * @return {Number} the factor (number of times)
     */
    getFactor: function(number) {
      var tmp = number;
      var factor = 0;
      while(tmp >= 1) {
        tmp /= 10;
        factor++;
      }
      return --factor;
    },

    /**
     * Returns the date format of the chart's ticks
     * @param  {Number}   the second-based range interval
     * @return {Function} the d3 format function
     */
    dateFormat: function(interval) {
      var interval = interval / 1000;
      return d3.time.format.multi([
        /* Less than an minute: second millisecond */
        ['%S.%L', function() { return interval / 60 < 1; }],
        /* Less than an hour: minute second */
        ['%M:%S', function() { return interval / 3600 < 1; }],
        /* Less than a day: hour minute */
        ['%H:%M', function() { return interval / (3600 * 24) < 1; }],
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

  });

  return ChartView;

});
