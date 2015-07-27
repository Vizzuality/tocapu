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

      var color = d3.scale.ordinal()
        .range(d3.range(this.options.colorCount));

      var showLabelPadding = 10;

      var svg = d3.select(this.svg)
        .attr('width', this.options.width)
        .attr('height', this.options.height);

      /* We define the scales and axis */
      var x = d3.scale.ordinal()
        .rangeBands([this.options.padding.left, width -
          this.options.yAxis.width], 0.1, 0);
      var yRange = [height - this.options.padding.top -
        this.options.padding.bottom - this.options.xAxis.height,
        showLabelPadding];
      var y = d3.scale.linear()
        .range(yRange);
      var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');
      /* We add the ticksFormat callback if exists */
      if(this.options.xAxis.tickFormat) {
        xAxis.tickFormat(this.options.xAxis.tickFormat);
      }
      var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');
      if(this.options.yAxis.tickCount) {
        yAxis.ticks(this.options.yAxis.tickCount);
      }

      /* We generate the svg container */
      var g = svg.append('g')
        .attr('transform', 'translate(' + this.options.padding.left + ',' +
          this.options.padding.top + ')');
      /* We create the domains */
      x.domain(this.options.series[0].values.map(function(d) { return d.x; }));
      var yFactor;
      var yDomain = d3.extent(this.options.series[0].values.map(function(d) {
        return d.y;
      }));
      /* We increase the y domain by 20% (10 up, 10 down) so we could see all
         the values */
      if(yDomain[0] !== yDomain[1]) {
        yDomain[0] = yDomain[0] - (yDomain[1] - yDomain[0]) * 0.1;
        yDomain[1] = yDomain[1] + (yDomain[1] - yDomain[0]) * 0.1;
      } else {
        var factor = this.getFactor(yDomain[0]);
        yDomain[0] -= Math.pow(10, factor);
        yDomain[1] += Math.pow(10, factor);
      }
      y.domain(yDomain);
      /* We compute the number of time we can divide the ticks by 1000 */
      yFactor = this.getFactor((yDomain[0] + yDomain[1]) / 2);
      /* We format the ticks of the axis */
      yAxis.tickFormat(function(d) {
        return +(d / Math.pow(10, yFactor)).toFixed(2);
      });

      /* We append the axis */
      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+this.options.yAxis.width+',' +
          (height - this.options.xAxis.height) + ')')
        .call(xAxis);
      var gY = g.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+this.options.yAxis.width+', 0)')
        .call(yAxis)
        .append('text');
      if(this.options.yAxis.showLabel) {
        var prefix = d3.formatPrefix(Math.pow(10, yFactor));
        gY
          .attr('y', 0)
          .attr('transform', 'translate(-'+this.options.yAxis.width+', 0)')
          .attr('dy', '.71em')
          .style('text-anchor', 'start')
          .attr('class', 'label')
          .text(prefix.symbol || '');
      }
      /* We append the grid, if active */
      if(this.options.yAxis.showGrid) {
        var yGrid = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickSize(-width + this.options.yAxis.width, 0, 0)
            .tickFormat('');
        if(this.options.yAxis.tickCount) {
          yGrid.ticks(this.options.yAxis.tickCount);
        }
        g.append('g')
          .attr('class', 'ruler y')
          .call(yGrid)
          .attr('transform', 'translate('+this.options.yAxis.width+', 0)');
      }

      /* We append the bars */
      g.append('g')
      .attr('transform', 'translate('+this.options.yAxis.width+', 0)')
      .selectAll('.bar')
      .data(this.options.series[0].values)
      .enter().append('rect')
        .attr('class', function(d) { return 'bar cat-'+color(d.x); })
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
