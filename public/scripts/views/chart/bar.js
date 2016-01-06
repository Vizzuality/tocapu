/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'backbone-super',
  'd3',
  'views/abstract/chart'
], function(_, Backbone, bSuper, d3, ChartView) {

  'use strict';

  var BarChartView = ChartView.extend({

    barDefaults: {
      yAxis: {
        showLabel: true,
        showGrid: true
      },
      padding: {
        top: 0,
        bottom: 10
      }
    },

    initialize: function(options) {
      var mergedOptions =  $.extend(true,
        $.extend(true, {}, this.barDefaults),
        _.omit(options, 'el') || {});
      this._super(mergedOptions);
    },

    render: function() {
      var width = this.getInnerWidth();
      var height = this.getInnerHeight();

      var showLabelPadding = 20;

      var svg = d3.select(this.svg)
        .attr('width', this.options.width)
        .attr('height', this.options.height);

      /* We generate the svg container */
      var g = svg.append('g')
        .attr('transform', 'translate(' + this.options.padding.left + ',' +
          this.options.padding.top + ')');

      /* We generate the x axis */
      var xDomain = d3.extent(this.options.series[0].values.map(function(d) {
        return d.x;
      }));

      var xRangeBands = [[this.options.padding.left, width -
          this.options.yAxis.width], 0.1, 0];

      var xOptions = {
        type: 'ordinal',
        domain: xDomain,
        rangeBands: xRangeBands,
        orientation: 'bottom',
        tickFormat: this.options.xAxis.tickFormat || null
      };

      var xAxis = this.generateAxis(xOptions);

      /* We generate the y axis */
      var yDomain = d3.extent(this.options.series[0].values.map(function(d) {
        return d.y;
      }));
      /* In case the domain is just one value, we artificially increase it */
      if(yDomain[0] === yDomain[1]) {
        var factor = this.getFactor(yDomain[0]);
        yDomain[0] -= Math.pow(10, factor);
        yDomain[1] += Math.pow(10, factor);
      }

      var yRange = [height - this.options.padding.top -
        this.options.padding.bottom - this.options.xAxis.height,
        showLabelPadding];

      var yFactor = this.getFactor((yDomain[0] + yDomain[1]) / 2);
      var prefix = d3.formatPrefix(Math.pow(10, yFactor));
      var yTickFormat = this.options.yAxis.tickFormat || function(d) {
        /* When the average value has a factor minor the 3 */
        if(prefix.symbol === '') { return Math.round10(d, -2); }
        return Math.round10(d / Math.pow(10, yFactor), -2);
      };

      var yOptions = {
        type: 'linear',
        domain: yDomain,
        range: yRange,
        orientation: 'left',
        ticks: this.options.yAxis.tickCount || null,
        tickFormat: yTickFormat
      };

      var yAxis = this.generateAxis(yOptions);

      /* We generate the color scale */
      var colorOptions = {
        type: 'ordinal',
        range: d3.range(this.options.colorCount)
      };

      var colorScale = this.generateScale(colorOptions);

      /* We append the axis */
      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + this.options.yAxis.width + ',' +
          (height - this.options.xAxis.height) + ')')
        .call(xAxis);
      var gY = g.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + this.options.yAxis.width + ', 0)')
        .call(yAxis)
        .append('text');

      if(this.options.yAxis.showLabel) {
        gY
          .attr('y', 0)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .attr('class', 'label')
          .text(prefix.symbol || '');
      }

      /* We append the grid, if active */
      if(this.options.yAxis.showGrid) {
        var yGrid = this.generateGrid(yAxis, width);

        g.append('g')
          .attr('class', 'ruler y')
          .call(yGrid)
          .attr('transform', 'translate(' + this.options.yAxis.width + ', 0)');
      }

      /* We append the bars */
      var x = xAxis.scale();
      var y = yAxis.scale();
      g.append('g')
      .attr('transform', 'translate('+this.options.yAxis.width+', 0)')
      .selectAll('.bar')
      .data(this.options.series[0].values)
      .enter().append('rect')
        .attr('class', function(d) { return 'bar cat-' + colorScale(d.x); })
        .attr('x', function(d) { return x(d.x); })
        .attr('width', x.rangeBand())
        .attr('y', function(d) { return y(d.y); })
        .attr('height', _.bind(function(d) {
          return height - (y(d.y) + this.options.xAxis.height);
        }, this));
    }

  });

  return BarChartView;

});
