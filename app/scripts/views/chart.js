define([
  'underscore',
  'backbone',
  'd3',
  'c3'
], function(_, Backbone, d3, c3) {

  'use strict';

  var ChartView = Backbone.View.extend({

    el: '#chartView',

    initialize: function(options) {
      this.params = options.params;
      this.chartType = options.type;
      this.account = options.account;
      this.data = options.data;
      this.xColumn = options.xColumn;
      this.yColumn = options.yColumn;
      this.draw();
    },

    draw: function() {
      this.chart = c3.generate({
        bindto: this.el,
        data: {
          x: this.xColumn,
          columns: [
            this.data.x,
            this.data.y
          ],
          type: this.chartType
        },
        axis: {
          x: {
            label: this.xColumn
          },
          y: {
            label: this.yColumn
          }
        },
        legend: {
          hide: true
        },
        size: {
          width: this.$el.innerWidth(),
          height: 400
        }
      });
    }

  });

  return ChartView;

});
