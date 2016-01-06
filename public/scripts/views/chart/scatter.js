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

      /* We generate the svg container */
      var g = svg.append('g')
        .attr('transform', 'translate(' + this.options.padding.left + ',' +
          this.options.padding.top + ')');

      /* We generate the x axis */
      var xDomain = d3.extent(this.options.series[0].values.map(function(d) {
        return d.x;
      }));

      if(xDomain[0] === xDomain[1]) {
        if(this.options.xAxis.timeserie) {
          var hourBefore = new Date(xDomain[0].getTime() - 3600 * 1000);
          var hourAfter = new Date(xDomain[0].getTime() + 3600 * 1000);
          xDomain[0] = hourBefore;
          xDomain[1] = hourAfter;
        } else {
          xDomain[0]--;
          xDomain[0]++;
        }
      }

      var xRange = [0, width - this.options.yAxis.width -
            this.options.padding.right - this.options.point.size];

      var xTickFormat = this.options.xAxis.tickCount || null;
      if(!xTickFormat) {
        if(this.options.xAxis.timeserie) {
          var interval = xDomain[1].getTime() - xDomain[0].getTime();
          xTickFormat = this.dateFormat(interval);
        }
        else {
          xTickFormat = function(d) { return d; };
        }
      }

      var xOptions = {
        type: this.options.xAxis.timeserie ? 'time' : 'linear',
        domain: xDomain,
        range: xRange,
        orientation: 'bottom',
        ticks: this.options.xAxis.tickCount || null,
        tickFormat: xTickFormat
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
      var occurenciesDomain = this.options.series[0].values.map(function(d) {
        return d.z;
      });
      occurenciesDomain = d3.extent(occurenciesDomain);

      var colorOptions = {
        type: 'ordinal',
        domain: occurenciesDomain,
        range: d3.range(this.options.colorCount)
      };

      var colorScale = this.generateScale(colorOptions);

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

      /* We append the dots */
      var x = xAxis.scale();
      var y = yAxis.scale();
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
