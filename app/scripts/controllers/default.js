define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'facade',
  'views/abstract/base',
  'views/account',
  'views/query',
  'views/chart',
  'views/datatable',
  'views/modal',
  'collections/data',
  'text!templates/default.handlebars',
  'text!sql/scatter.pgsql',
  'text!sql/dataQuery.pgsql'
], function(_, Backbone, bSuper, Handlebars, fc, BaseView, AccountView,
  QueryView, ChartView, DataTableView, ModalView, DataCollection, TPL,
  scatterSQL, dataSQL) {

  'use strict';

  var DefaultView = BaseView.extend({

    el: 'body',

    template: TPL,
    scatterTemplate: Handlebars.compile(scatterSQL),
    dataQueryTemplate: Handlebars.compile(dataSQL),

    initialize: function() {
      var accountView = new AccountView({ el: '#accountView' });
      this.addView({ accountView: accountView });
      var queryView = new QueryView({ el: '#queryView' });
      this.addView({ queryView: queryView });
      this.data = new DataCollection();
      var chartView = new ChartView({ collection: this.data });
      this.addView({ chartView: chartView });
      var tableView = new DataTableView({ collection: this.data });
      this.addView({ tableView: tableView });
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('chart:render', this.fetchData, this);
    },

    /**
     * Indicates if the embed has all the required information to render the
     * graph
     * @return {Boolean} true if all the information are here, false otherwise
     */
    isValid: function() {
      // return (fc.get('account') && fc.get('table') && fc.get('graph') &&
      //   fc.get('x') && fc.get('y'));
    },

    /**
     * Fetches the data from the CartoDB account
     */
    fetchData: function() {
      var template = '';
      var data = {
        table: fc.get('table'),
        columns: { x: fc.get('x'), y: fc.get('y') }
      };
      switch(fc.get('graph')) {
        case 'scatter':
          template = this.scatterTemplate(data);
          break;

        default:
          template = this.dataQueryTemplate(data);
          break;
      }
      this.data.fetch({ data: {q: template} });
    },

    /**
     * Opens the embed modal
     * @param  {Object} e the event associated to the click on the link
     */
    openEmbed: function(e) {
      e.preventDefault();
      var url  = 'http://'+location.host+'/#embed/'+location.hash.split('#')[1];
      var content  = '<p>Bla bla bla</p>';
          content += '<input type="text" value=\'';
          content += '<iframe src="'+url+'"></iframe>';
          content += '\'>';
      new ModalView({
        title: 'Embed code',
        content: content
      });
    },

    /**
     * Opens the share modal
     * @param  {Object} e the event associated to the click on the link
     */
    openShare: function(e) {
      e.preventDefault();
      var content  = '<p>Look at this, that\'s amazing!</p>';
          content += '<input type="text" value="';
          content += location.href;
          content += '">';
      new ModalView({
        title: 'Share code',
        content: content
      });
    },

    afterRender: function() {
      this.$el.find('#embed').on('click', _.bind(this.openEmbed, this));
      this.$el.find('#share').on('click', _.bind(this.openShare, this));
    }

  });

  return DefaultView;
});
