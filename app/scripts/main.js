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
  'text!sql/scatter.pgsql'
], function(Backbone, Handlebars, quipu, Facade, AccountView, QueryView, ChartView, DataTableView, AccountModel, DataCollection, scatterSQL) {

  'use strict';

  var Tocapu = Backbone.View.extend({

    el: 'body',

    dataQueryTemplate: Handlebars.compile(scatterSQL),

    initialize: function() {
      this.account = new AccountView({ el: '#accountView' });
      this.query = new QueryView({ el: '#queryView' });
      Facade.set('data', new DataCollection());

      _.bindAll(this, 'parseData');
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('chart:render', this.getData);
      this.listenTo(this, 'data:change', this.renderChart); // Fuera
      this.listenTo(this, 'data:change', this.renderTable); // Fuera
      // this.listenTo(this.data, 'sync', this.onSyncData); // llamar a this.renderChart y this.renderTable
    },

    getData: function(options) {
      this.params = {
        table:    options.table,
        xColumn:  options.xColumn,
        yColumn:  options.yColumn,
        type:     options.type
      };

      this.data
        .setUsername(this.account.model.attributes.username)
        .fetch({
          data: {
            q: this.dataQueryTemplate({
              table: this.params.table,
              columnA: this.params.xColumn,
              columnB: this.params.yColumn
            })
          },
          context: this,
          success: this.parseData
        });
    },

    parseData: function() { // Este parse va en la colección
      var chartData  = { x: [this.params.xColumn], y: [this.params.yColumn] },
          tableData  = {},
          rows       = this.data.toJSON()[0].rows;

      tableData.columns = [ this.params.xColumn, this.params.yColumn ];
      tableData.rows    = [];

      _.each(rows || [], function(d) {
        chartData.x.push(d[this.params.xColumn]);
        chartData.y.push(d[this.params.yColumn]);

        var tableRow = [d[this.params.xColumn], d[this.params.yColumn]];
        tableData.rows.push(tableRow);
      }, this);

      this.trigger('data:change', { chartData: chartData, tableData: tableData });
    },

    renderChart: function(data) {
      this.chart = new ChartView({
        account: this.account.model,
        type: this.params.type,
        data: data.chartData,
        xColumn: this.params.xColumn,
        yColumn: this.params.yColumn
      });
    },

    renderTable: function(data) {
      this.datable = new DataTableView({
        el: '#dataTable',
        data: data.tableData
      });
    },

    start: function() {
      Backbone.history.start({ pushState: false });
    }

  });

  new Tocapu().start();

});
