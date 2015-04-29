define([
  'underscore',
  'backbone',
  'handlebars',
  'lib/quipu',
  'facade',
  'config',
  'views/account',
  'views/query',
  'views/chart',
  'views/datatable',
  'views/modal',
  'models/account',
  'collections/data',
  'text!sql/scatter.pgsql',
  'text!sql/dataQuery.pgsql',
  'text!templates/main.handlebars'
], function(_, Backbone, Handlebars, quipu, fc, Config, AccountView, QueryView,
  ChartView, DataTableView, ModalView, AccountModel, DataCollection, scatterSQL,
  dataSQL, TPL) {

  'use strict';

  var Main = Backbone.View.extend({

    el: 'body',

    template: Handlebars.compile(TPL),

    scatterTemplate: Handlebars.compile(scatterSQL),
    dataQueryTemplate: Handlebars.compile(dataSQL),

    initialize: function() {
      this.render(); /* Needs to be the first instruction so the views can
                        render using their el elements */

      this.data  = new DataCollection();
      this.chart = new ChartView({ collection: this.data });

      /* Some views are useless in the embedded view */
      if(!fc.get('isEmbed')) {
        this.account = new AccountView({ el: '#accountView' });
        this.query   = new QueryView({ el: '#queryView' });
        this.table   = new DataTableView({ collection: this.data });
      }

      _.bindAll(this, 'getData');

      this.setListeners();
    },

    setListeners: function() {
      this.$el.find('#embed').on('click', _.bind(this.openEmbed, this));
      this.$el.find('#share').on('click', _.bind(this.openShare, this));

      Backbone.Events.on('data:retrieve', this.getData, this);
      Backbone.Events.on('account:reset', this.reset, this);
      Backbone.Events.on('route:change', this.resumeState, this);
    },

    /**
     * Renders the sidebar
     */
    render: function() {
      this.$el.html(this.template({
        isEmbed: fc.get('isEmbed') !== undefined
      }));
    },

    /**
     * Resumes the application's state from the params stored in the facade
     */
    resumeState: function() {
      if(!fc.get('isEmbed')) {
        if(this.account) {
          /* this.account is undefined when the user changes manually the URL
             from an embedded view to a normal one without reloading the
             browser */
          this.account.setAccount(false);
        }
      }
      else { /* We directly execute the last SQL query */
        Backbone.Events.trigger('data:retrieve');
      }
    },

    /**
     * Fetches the graph's data from the server
     */
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
        _.each(Config.columns, function(value, columnName) {
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

    /**
     * Resets the whole application
     */
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

    /**
     * Opens the embed modal
     * @param  {Object} e the event associated to the click on the link
     */
    openEmbed: function(e) {
      e.preventDefault();

      if(this.query.validateForm()) {
        var url  = 'http://'+location.host+'/#embed/';
            url += location.hash.split('#')[1];

        var content  = '<p>Bla bla bla</p>';
            content += '<input type="text" value=\'';
            content += '<iframe src="'+url+'"></iframe>';
            content += '\'>';

        new ModalView({
          title: 'Embed code',
          content: content
        });
      }
    },

    /**
     * Opens the share modal
     * @param  {Object} e the event associated to the click on the link
     */
    openShare: function(e) {
      e.preventDefault();

      var content  = '<p>Look at this, that\'s amazing!</p>';
          content += '<input type="text" value=\'';
          content += '<iframe src="'+location.href+'"></iframe>';
          content += '\'>';

      new ModalView({
        title: 'Share code',
        content: content
      });
    }

  });

  return Main;

});
