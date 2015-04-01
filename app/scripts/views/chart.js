define([
  'underscore',
  'backbone',
  'handlebars',
  'moment',
  'd3',
  'c3',
  'uri/URI',
  'collections/data',
  'text!sql/scatter.pgsql'
], function(_, Backbone, Handlebars, moment, d3, c3, URI, DataCollection, scatterSQL) {

  'use strict';

  var ChartView = Backbone.View.extend({

    el: '#chartView',

    template: Handlebars.compile(scatterSQL),

    initialize: function(options) {
      _.bindAll(this, 'parseData');
      this.params = options.params;
      this.chartType = options.type;
      this.account = options.account;
      this.draw();
    },

    draw: function() {
      this.getData()
        .done(_.bind(function(collection) {
          var data = this.parseData(collection.toJSON());

          this.chart = c3.generate({
            bindto: this.el,
            data: {
              x: this.params.xcolumn,
              columns: [
                data.x,
                data.y
              ],
              type: this.chartType
            },
            axis: {
              x: {
                label: this.params.xcolumn
              },
              y: {
                label: this.params.ycolumn
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
      var results = { x: [this.params.xcolumn], y: [this.params.ycolumn] };

      _.each(data[0].rows || [], function(d) {
        results.x.push(d[this.params.xcolumn]);
        results.y.push(d[this.params.ycolumn]);
      }, this);

      return results;
    }

  });

  return ChartView;

});
