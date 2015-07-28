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

    /**
     * Returns a scale d3 object based on the given options
     * @param  {Object} an object containing the following options:
     *                  - type        {String} linear, ordinal or time
     *                  - range       {Array}
     *                  - domain      {Array} optional
     * @return {Object} the d3 scale
     **/
    generateScale: function(options) {
      if(!options || !options.type || !options.range && !options.rangeBands) {
        console.error('generateScale needs to be called with all its required' +
          ' options');
        return;
      }

      var scale;
      switch(options.type) {
        case 'linear':
          scale = d3.scale.linear();
          break;
        case 'ordinal':
          scale = d3.scale.ordinal();
          break;
        case 'time':
          scale = d3.time.scale();
          break;
        default:
          console.error('generateScale has to be have a valid type parameter');
          return;
      }

      if(options.domain) {
        scale.domain(options.domain);
      }

      if(options.range) {
        scale.range(options.range);
      } else if(scale.rangeBands && options.rangeBands) {
        scale.rangeBands.apply(this, options.rangeBands);
      }

      return scale;
    },

    /**
     * Returns a axis d3 object based on the given options
     * @param  {Object} options an object containing the following options:
     *                  - type        {String} linear, ordinal or time
     *                  - range       {Array}
     *                  - domain      {Array} optional
     *                  - orientation {String} top, bottom, left or right
     *                  - ticks       {Method} optional
     *                  - tickFormat  {Method} options
     *                  - tickSize    {Method} options
     * @return {Object} the d3 axis
     **/
    generateAxis: function(options) {
      if(!options || !options.orientation) {
        console.error('generateAxis needs to be called with all its required' +
          ' options');
        return;
      }

      var scale = this.generateScale(options);

      var axis = d3.svg.axis()
        .scale(scale)
        .orient(options.orientation);

      axis.ticks(options.ticks || null);
      axis.tickFormat(options.tickFormat || null);
      axis.tickSize(options.tickSize || null);

      return axis;
    },

    /**
     * Returns a axis d3 object used as a grid
     * @param  {Object} axis the axis on which the grid is based
     * @param  {Number} width the inner width of the container
     * @return {Object} the grid
     **/
    generateGrid: function(axis, width) {
      if(!axis || !width) {
        console.error('generateGrid requires all its parameters');
        return;
      }

      return d3.svg.axis()
        .scale(axis.scale())
        .orient('left')
        .tickSize(-width + this.options.yAxis.width, 0, 0)
        .tickFormat('')
        .ticks(this.options.yAxis.tickCount || null);
    }

  });

  return ChartView;

});
