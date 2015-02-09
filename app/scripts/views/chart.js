define([
  'underscore',
  'backbone',
  'moment',
  'd3',
  'nvd3',
  'uri/URI',
  'collections/data'
], function(_, Backbone, moment, d3, nv, URI, DataCollection) {

  'use strict';

  var ChartView = Backbone.View.extend({

    initialize: function(options) {
      _.bindAll(this, 'parseData');
      this.params = options.params;
      this.draw();
    },

    draw: function() {
      var chart = nv.models.scatterChart()
        .showDistX(true)
        .showDistY(true)
        .transitionDuration(350)
        .color(d3.scale.category10().range());

      chart.scatter.onlyCircles(true);

      this.getData()
        .done(_.bind(function(collection) {
          var data = this.parseData(collection.toJSON());
          d3.select('#chartView')
            .append('svg')
            .attr('width', this.$el.width())
            .attr('height', 500)
            .datum(data)
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
      var template = _.template('SELECT <%= columnA %>, <%= columnB %>, COUNT((<%= columnA %>,<%= columnB %>)) AS density FROM <%= table %> GROUP BY <%= columnA %>,<%= columnB %>');
      data.fetch({
        data: {
          q: this.params.query || template({
            table: this.params.table,
            columnA: this.params.xcolumn,
            columnB: this.params.ycolumn
          }),
          apikey: urlParams.apikey
        },
        success: deferred.resolve
      });
      return deferred.promise();
    },

    parseData: function(data) {
      var result = [{
        values: _.map(data, function(d) {
          var x = Number(d[this.params.xcolumn]);
          var y = Number(d[this.params.ycolumn]);
          if (moment(x).isValid()) {
            x = moment(x).valueOf();
          }
          return {
            x: x,
            y: y
          };
        }, this)
      }];
      return result;
    }

  });

  return ChartView;

});
