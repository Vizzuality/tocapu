require.config({

  baseUrl: 'scripts',

  paths: {
    jquery: '../../bower_components/jquery/dist/jquery',
    underscore: '../../bower_components/underscore/underscore',
    backbone: '../../bower_components/backbone/backbone',
    handlebars: '../../bower_components/handlebars/handlebars',
    d3: '../../bower_components/d3/d3',
    c3: '../../bower_components/c3/c3',
    text: '../../bower_components/text/text',
    moment: '../../bower_components/moment/moment',
    uri: '../../bower_components/uri.js/src'
  },

  shim: {
    'd3': {
      exports: 'd3'
    }
  }

});

require([
  'backbone',
  'lib/quipu',
  'router',
  'views/account',
  'views/query',
  'views/chart'
], function(Backbone, quipu, Router, AccountView, QueryView, ChartView) {

  'use strict';

  var Tocapu = Backbone.View.extend({

    el: 'body',

    initialize: function() {
      this.account = new AccountView({ el: '#accountView' });
      this.query = new QueryView({ el: '#queryView' });
      // At begining show account view
      this.account.render();
      // Set events
      this.setListeners();
    },

    setListeners: function() {
      this.listenTo(this.account.model, 'change', this.query.showTables);
      this.listenTo(this.query, 'chart:render', this.renderChart);
    },

    renderChart: function(options) {
      this.chart = new ChartView({
        account: this.account.model,
        type: options.type,
        params: {
          table:    options.table,
          xColumn:  options.xColumn,
          yColumn:  options.yColumn
        }
      });
    },

    start: function() {
      Backbone.history.start({ pushState: false });
    }

  });

  new Tocapu().start();

});
