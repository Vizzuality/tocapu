/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'backbone-super',
  'views/abstract/base'
], function(_, Backbone, bSuper, BaseView) {

  'use strict';

  var ChartView = BaseView.extend({

    defaults: {
      width: 500,
      height: 400,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
      xAxis: {
        height: 20,
        timeserie: false,
        tickCount: null
      },
      yAxis: {
        width: 25,
        showLabel: false,
        showGrid: false,
        tickFormat: null
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
    }

  });

  return ChartView;

});
