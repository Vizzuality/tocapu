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
  'underscore',
  'backbone',
  'handlebars',
  'lib/quipu',
  'facade',
  'router',
  'views/account',
  'views/query',
  'views/chart',
  'views/datatable',
  'models/account',
  'collections/data',
  'text!sql/scatter.pgsql',
  'text!sql/dataQuery.pgsql'
], function(_, Backbone, Handlebars, quipu, fc, Router, AccountView, QueryView,
  ChartView, DataTableView, AccountModel, DataCollection, scatterSQL, dataSQL) {

  'use strict';

  var Tocapu = Backbone.View.extend({

    el: 'body',

    scatterTemplate: Handlebars.compile(scatterSQL),
    dataQueryTemplate: Handlebars.compile(dataSQL),

    initialize: function() {
      this.account = new AccountView({ el: '#accountView' });
      this.query = new QueryView({ el: '#queryView' });
      this.data = new DataCollection();
      this.chart = new ChartView({ collection: this.data });
      this.table = new DataTableView({ collection: this.data });

      _.bindAll(this, 'getData');
      this.setListeners();

      this.router = new Router();
    },

    setListeners: function() {
      Backbone.Events.on('data:retrieve', this.getData, this);
      Backbone.Events.on('account:reset', this.reset, this);
      Backbone.Events.on('route:change', this.resumeState, this);
    },

    /**
     * Resumes the application's state from the params stores in the facade
     */
    resumeState: function() {
      if(fc.get('account')) {
        /* If the account's name is the same, we don't update it */
        if(fc.get('account') !== this.account.getAccountName()) {
          this.account.setAccount(false);
        }
        else {
          this.query.setTable();
        }
      }
    },

    getData: function() {
      var template,
          params = {
            table:   fc.get('table'),
            columns: fc.get('columnsName')
          };

      switch(fc.get('graph')) {
        case 'scatter':
          template = this.scatterTemplate(params);
          break;

        default:
          template = this.dataQueryTemplate(params);
          break;
      }

      this.data.fetch({ data: {q: template} });
    },

    reset: function() {
      /* DO NOT use view.remove() here as it destroys the el element
         See the Backbone's annoted sources */

      /* We reset the facade and the URL */
      fc.reset();
      Backbone.Events.trigger('route:update');

      /* We reset the query view */
      this.query.stopListening();
      this.query.$el.children().remove();
      this.query = new QueryView({ el: '#queryView' });

      /* We reset the chart view */
      this.chart.stopListening();
      this.chart.$el.children().remove();
      this.chart = new ChartView({ collection: this.data });

      /* We reset the table view */
      this.table.stopListening();
      this.table.$el.children().remove();
      this.table = new DataTableView({ collection: this.data });
    },

    start: function() {
      Backbone.history.start({ pushState: false });
    }

  });

  new Tocapu().start();

});
