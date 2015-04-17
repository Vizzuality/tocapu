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
  'handlebars',
  'lib/quipu',
  'facade',
  'views/account',
  'views/query',
  'views/chart',
  'views/datatable',
  'models/account',
  'collections/data',
  'text!sql/dataQuery.pgsql'
], function(Backbone, Handlebars, quipu, Facade, AccountView, QueryView, ChartView, DataTableView, AccountModel, DataCollection, dataSQL) {

  'use strict';

  var Tocapu = Backbone.View.extend({

    el: 'body',

    dataQueryTemplate: Handlebars.compile(dataSQL),

    initialize: function() {
      this.account = new AccountView({ el: '#accountView' });
      this.query = new QueryView({ el: '#queryView' });
      this.data = new DataCollection();
      this.chart = new ChartView({ collection: this.data });
      this.table = new DataTableView({ collection: this.data });

      _.bindAll(this, 'getData');
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('data:retrieve', _.bind(this.getData, this));
      Backbone.Events.on('account:reset', _.bind(this.reset, this));
    },

    getData: function() {
      this.data
        .fetch({
          data: {
            q: this.dataQueryTemplate({
              table: Facade.get('tableName'),
              columns: Facade.get('columnsName')
            })
          }
        });
    },

    reset: function() {
      /* DO NOT use view.remove() here as it destroys the el element
         See the annoted sources */

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
