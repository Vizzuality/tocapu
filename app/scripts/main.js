define([
  'underscore',
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
  'text!sql/scatter.pgsql',
  'text!sql/dataQuery.pgsql',
  'text!templates/main.handlebars'
], function(_, Backbone, Handlebars, quipu, fc, AccountView, QueryView,
  ChartView, DataTableView, AccountModel, DataCollection, scatterSQL, dataSQL,
  TPL) {

  'use strict';

  var Main = Backbone.View.extend({

    el: 'body',

    template: Handlebars.compile(TPL),

    scatterTemplate: Handlebars.compile(scatterSQL),
    dataQueryTemplate: Handlebars.compile(dataSQL),

    config: {
      columns: ['x', 'y'] /* The columns names availables in the app */
    },

    initialize: function() {
      this.render(); /* Needs to be the first instruction so the views can
                        render using the el element */

      this.data    = new DataCollection();
      this.chart   = new ChartView({ collection: this.data });

      if(!fc.get('isEmbed')) { /* these views are useless in an embedded view */
        this.account = new AccountView({ el: '#accountView' });
        this.query   = new QueryView({ el: '#queryView' });
        this.table   = new DataTableView({ collection: this.data });
      }

      _.bindAll(this, 'getData');

      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('data:retrieve', this.getData, this);
      Backbone.Events.on('account:reset', this.reset, this);
      Backbone.Events.on('route:change', this.resumeState, this);
    },

    render: function() {
      this.$el.html(this.template({
        isEmbed: fc.get('isEmbed') ? true : false
      }));
    },

    /**
     * Resumes the application's state from the params stored in the facade
     */
    resumeState: function() {
      if(!fc.get('isEmbed')) {
        this.account.setAccount(false);
      }
      else { /* We directly execute the last SQL query */
        Backbone.Events.trigger('data:retrieve');
      }
    },

    getData: function() {
      var template,
          params = {
            table:   fc.get('table'),
            columns: fc.get('columnsName')
          };

      /* In the case of an embedded view, we need to recreate the facade's
         columnsName object */
      if(fc.get('isEmbed')) {
        var columns = {};
        _.each(this.config.columns, function(columnName) {
          if(fc.get(columnName)) {
            columns[columnName] = fc.get(columnName);
          }
        }, this);

        fc.set('columnsName', columns);
        params.columns = columns;
      }

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
    }

  });

  return Main;

});
