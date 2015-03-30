define([
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'd3',
  'nvd3',
  'uri/URI',
  'collections/data',
  'text!sql/scatter.pgsql'
], function(_, Backbone, Handlebars, moment, d3, nv, URI, DataCollection, scatterSQL) {

  'use strict';

  var ChartView = Backbone.View.extend({

    el: '#chartView',

    template: Handlebars.compile(scatterSQL),

    initialize: function(options) {
      _.bindAll(this, 'parseData');
      this.params = options.params;
      this.account = options.account;
      this.draw();
    },

    draw: function() {
      var chart = nv.models.scatterChart()
        .showDistX(true)
        .showDistY(true)
        .duration(350)
        .color(d3.scale.category10().range());

      this.getData()
        .done(_.bind(function(collection) {
          var data = this.parseData(collection.toJSON());
          d3.select(this.el)
            .append('svg')
            .attr('width', this.$el.width())
            .attr('height', 500)
            .datum([data])
            .call(chart);
        }, this));
    },

    getData: function() {
      var deferred = new $.Deferred();
      var query = window.location.search;
      var urlParams = URI.parseQuery(query);
      var data = new DataCollection({
        username: urlParams.username
      });

      data
        .setUsername(this.account.attributes.username)
        .fetch({
          data: {
            q: this.params.query || this.template({
              table: this.params.table,
              columnA: this.params.xcolumn,
              columnB: this.params.ycolumn
            })
          },
          success: deferred.resolve
        });

      return deferred.promise();
    },

    parseData: function(data) {
      var results = {

        key: 'series 1',
        values: _.map(data[0].rows || [], function(d) {

          var x = d[this.params.xcolumn];
          var y = d[this.params.ycolumn];

          return {
            x: x,
            y: y
          };

        }, this)

      };

      return results;
    }

  });

  return ChartView;

});
