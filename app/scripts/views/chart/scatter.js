/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'backbone-super',
  'd3',
  'views/abstract/chart'
], function(_, Backbone, bSuper, d3, ChartView) {

  'use strict';

  var ScatterChartView = ChartView.extend({

    scatterDefaults: {
      yAxis: {
        showLabel: true,
        showGrid: true
      },
      padding: {
        bottom: 10,
        right: 10
      },
      point: {
        type: 'circle',
        size: 4
      }
    },

    initialize: function(options) {
      var mergedOptions =  $.extend(true,
        $.extend(true, {}, this.scatterDefaults),
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

      /* We define the scales and axis */
      var x;
      if(this.options.xAxis.timeserie) {
        x = d3.time.scale()
          .range([0, width - this.options.yAxis.width -
            this.options.padding.right - this.options.point.size]);
      }
      else {
        x = d3.scale.linear()
          .range([0, width - this.options.yAxis.width -
            this.options.padding.right - this.options.point.size]);
      }
      var yRange = [height - this.options.padding.top -
        this.options.padding.bottom - this.options.xAxis.height,
        showLabelPadding];
      var y = d3.scale.linear()
        .range(yRange);
      var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

      /* We create the domains */
      var xDomain = d3.extent(this.options.series[0].values.map(function(d) {
        return d.x;
      }));
      if(xDomain[0] === xDomain[1]) {
        if(this.options.xAxis.timeserie) {
          var hourBefore = new Date(xDomain[0].getTime() - 3600 * 1000);
          var hourAfter = new Date(xDomain[0].getTime() + 3600 * 1000);
          xDomain[0] = hourBefore;
          xDomain[1] = hourAfter;
          x.domain(xDomain);
        } else {
          x.domain([xDomain[0]--, xDomain[0]++]);
        }
      } else {
        x.domain(xDomain);
      }

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

      /* We format the ticks of the axis */
      else if(this.options.xAxis.timeserie) {
        var interval = xDomain[1].getTime() - xDomain[0].getTime();
        xAxis.tickFormat(this.dateFormat(interval));
      }
      else {
        xAxis.tickFormat(function(d) { return d; });
      }
       /* We limit the number of ticks */
      if(this.options.xAxis.tickCount) {
        xAxis.ticks(this.options.xAxis.tickCount);
      }
      if(this.options.yAxis.tickCount) {
        yAxis.ticks(this.options.yAxis.tickCount);
      }

      /* We generate the svg container */
      var g = svg.append('g')
        .attr('transform', 'translate(' + this.options.padding.left + ',' +
          this.options.padding.top + ')');

      /* We contruct the color scale for the 'heat map' */
      var occurenciesDomain = this.options.series[0].values.map(function(d) {
        return d.z;
      });
      occurenciesDomain = d3.extent(occurenciesDomain);
      var colorScale = d3.scale.ordinal()
        .domain(occurenciesDomain)
        .range(d3.range(this.options.colorCount));

      var yFactor;
      var yDomain = d3.extent(this.options.series[0].values.map(function(d) {
        return d.y;
      }));
      /* In case the domain is just one value, we artificially increase it */
      if(yDomain[0] === yDomain[1]) {
        var factor = this.getFactor(yDomain[0]);
        yDomain[0] -= Math.pow(10, factor);
        yDomain[1] += Math.pow(10, factor);
      }
      y.domain(yDomain);
      /* We compute the number of time we can divide the ticks by 1000 */
      yFactor = this.getFactor((yDomain[0] + yDomain[1]) / 2);
      if(yFactor < 0) { yFactor = 0; }
      /* We format the ticks of the axis */
      yAxis.tickFormat(function(d) {
        return +(d / Math.pow(10, yFactor)).toFixed(2);
      });

      /* We append the axis */
      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' + (this.options.yAxis.width +
          this.options.point.size / 2) + ',' + (height -
          this.options.xAxis.height) + ')')
        .call(xAxis)
        .selectAll('.tick').classed('is-visible', true);
      var gY = g.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+this.options.yAxis.width+', 0)')
        .call(yAxis)
        .append('text');
      if(this.options.yAxis.showLabel) {
        var prefix = d3.formatPrefix(Math.pow(10, yFactor));
        gY
          .attr('y', 0)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
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

      /* We append the dots */
      if(this.options.point.type === 'circle') {
        g.append('g')
          .attr('transform', 'translate('+this.options.yAxis.width+', 0)')
          .selectAll('.point')
          .data(this.options.series[0].values)
          .enter().append('circle')
            .attr('class', function(d) {
              return 'point level-' + colorScale(d.z);
            })
            .attr('r', this.options.point.size)
            .attr('cx', function(d) { return x(d.x); })
            .attr('cy', function(d) { return y(d.y); });
      }
    }

  });

  return ScatterChartView;

});
