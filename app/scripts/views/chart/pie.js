/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'backbone-super',
  'd3',
  'views/abstract/chart'
], function(_, Backbone, bSuper, d3, ChartView) {

  'use strict';

  var PieChartView = ChartView.extend({

    pieDefaults: {
      padding: { top: 20, bottom: 20, left: 20, right: 20 }
    },

    initialize: function(options) {
      var mergedOptions =  $.extend(true,
        $.extend(true, {}, this.pieDefaults),
        _.omit(options, 'el') || {});
      this._super(mergedOptions);
    },

    render: function() {
      var width = this.getInnerWidth();
      var height = this.getInnerHeight();

      var svg = d3.select(this.svg)
        .attr('width', this.options.width)
        .attr('height', this.options.height);

      this.options.outerRadius = Math.min(width, height -
        this.options.legend.height) / 2;
      this.options.innerRadius = 0;

      /* We define the pie elements */
      var color = d3.scale.ordinal()
        .range(d3.range(this.options.colorCount));
      var arc = d3.svg.arc()
        .outerRadius(this.options.outerRadius)
        .innerRadius(this.options.innerRadius);
      var pie = d3.layout.pie()
        .value(function(d) { return d.y; });

      var g = svg.append('g')
        .attr('transform', 'translate(' +
          (width / 2 + this.options.padding.left) + ',' +
          (this.options.outerRadius + this.options.padding.top) + ')');
      var pie = g.selectAll('.arc')
        .data(pie(this.options.series[0].values))
        .enter().append('g')
          .attr('class', 'arc');
      pie.append('path')
        .attr('d', arc)
        .attr('class', function(d) { return 'cat-' + color(d.data.x); });
      var total = this.options.series[0].values.reduce(function(ret, d) {
        return ret + d.y;
      }, 0);
      var radius = 3;
      var margin = 12;
      var legend = svg.append('g')
        .attr('class', 'legend')
        .attr('height', this.options.legend.height)
        .attr('width', width)
        .selectAll('g')
        .data(_.sortBy(this.options.series[0].values, function(d) {
          return -d.y;
        }))
        .enter().append('g');
      legend
        .append('text')
        .attr('dy', '.7em')
        .text(function(d) { return d.x + ' (' + Math.round(d.y / total * 100) +
          '%)'; })
        .attr('transform', function(d, i) {
          var offset = 3 * radius;
          if(i > 0) {
            var previousItem = this.parentElement.parentElement
                  .childNodes[i - 1].querySelector('text'),
                previousItemWidth = previousItem.getBBox().width,
                previousItemOffset = parseFloat(previousItem
                  .getAttribute('transform').split(',')[0].split('(')[1]);
            offset = previousItemWidth + previousItemOffset + margin + offset;
          }
          return 'translate('+offset+', 0)';
        });
      legend
        .append('circle')
        .attr('cx', function(d, i) {
          var offset = radius;
          if(i > 0) {
            var previousItem = this.parentElement.parentElement
                  .childNodes[i - 1].querySelector('text'),
                previousItemWidth = previousItem.getBBox().width,
                previousItemOffset = parseFloat(previousItem
                  .getAttribute('transform').split(',')[0].split('(')[1]);
            offset = previousItemWidth + previousItemOffset + margin + radius;
          }
          return offset;
        })
        .attr('cy', 5)
        .attr('r', radius)
        .attr('class', function(d) { return 'cat-'+color(d.x); });
      svg.select('.legend')
        .attr('transform', 'translate(' + this.options.padding.left + ', ' +
          (height - this.options.legend.height + 10 +
           this.options.padding.top) + ')');

    }

  });

  return PieChartView;

});
