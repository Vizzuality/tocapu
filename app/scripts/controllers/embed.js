define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'facade',
  'config',
  'views/abstract/base',
  'views/chart',
  'collections/data',
  'text!templates/embed.handlebars',
  'text!sql/scatter.pgsql',
  'text!sql/pie.pgsql',
  'text!sql/dataQuery.pgsql'
], function(_, Backbone, bSuper, Handlebars, fc, Config, BaseView, ChartView,
  DataCollection, TPL, scatterSQL, pieSQL, dataSQL) {

  'use strict';

  var EmbedView = BaseView.extend({

    el: 'body',

    template: TPL,
    scatterTemplate: Handlebars.compile(scatterSQL),
    pieTemplate: Handlebars.compile(pieSQL),
    dataQueryTemplate: Handlebars.compile(dataSQL),

    initialize: function() {
      this.data = new DataCollection();
      var chartView = new ChartView({ collection: this.data });
      this.addView({ chartView: chartView });
    },

    /**
     * Indicates if the embed has all the required information to render the
     * graph
     * @return {Boolean} true if all the information are here, false otherwise
     */
    isValid: function() {
      var isValid = true;
      if(fc.get('account') && fc.get('table') && fc.get('graph')) {
        if(Config.charts[fc.get('graph')]) {
          _.each(Config.charts[fc.get('graph')].columns, function(columnsName) {
            if(!fc.get(columnsName)) {
              isValid = false;
            }
          });
          return isValid;
        }
      }
      return false;
    },

    /**
     * Fetches the data from the CartoDB account
     */
    fetchData: function() {
      var template = '';
      var data = {
        table: fc.get('table'),
        columns: { }
      };
      _.each(Config.charts[fc.get('graph')].columns, function(name) {
        if(fc.get(name)) {
          data.columns[name] = fc.get(name);
        }
      });
      switch(fc.get('graph')) {
        case 'pie':
          template = this.pieTemplate(data);
          break;

        default: /* Scatter */
          template = this.scatterTemplate(data);
          break;
      }
      this.data.fetch({ data: {q: template} });
    },

    afterRender: function() {
      if(!this.isValid()) {
        var error = 'Some information are missing to fetch the data, please ' +
          'reconfigure the embed clicking on that link: LINK';
        this.views.chartView.trigger('error', error);
      }
      else {
        this.fetchData();
      }
    },

    beforeDestroy: function() {
      this.data.off();
      this.data = null;
    }

  });

  return EmbedView;
});
