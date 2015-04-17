define([
  'underscore',
  'backbone',
  'facade',
  'helpers/utils',
  'd3',
  'c3'
], function(_, Backbone, Facade, Utils, d3, c3) {

  'use strict';

  var ChartView = Backbone.View.extend({

    el: '#chartView',

    initialize: function() {
      this.collection.on('sync', _.bind(this.render, this));
    },

    render: function(collection) {
      var data = Utils.extractData(collection).chartData;
      this.chart = c3.generate({
        bindto: this.el,
        data: {
          x: Facade.get('columnsName').x,
          columns: [
            data[Facade.get('columnsName').x],
            data[Facade.get('columnsName').y]
          ],
          type: Facade.get('graphType')
        },
        axis: {
          x: {
            label: Facade.get('columnsName').x
          },
          y: {
            label: Facade.get('columnsName').y
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
      return this;
    }

  });

  return ChartView;

});
