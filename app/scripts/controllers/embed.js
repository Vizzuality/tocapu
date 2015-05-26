define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'facade',
  'views/abstract/base',
  'views/chart',
  'collections/data',
  'text!templates/embed.handlebars',
  'text!sql/scatter.pgsql',
  'text!sql/dataQuery.pgsql'
], function(_, Backbone, bSuper, Handlebars, fc, BaseView, ChartView,
  DataCollection, TPL, scatterSQL, dataSQL) {

  'use strict';

  var EmbedView = BaseView.extend({

    el: 'body',

    template: TPL,
    scatterTemplate: Handlebars.compile(scatterSQL),
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
      return (fc.get('account') && fc.get('table') && fc.get('graph') &&
        fc.get('x') && fc.get('y'));
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

    afterRender: function() {
      if(!this.isValid()) {
        var error = 'Some information are missing to fetch the data, please ' +
          'reconfigure the embed clicking on that link: LINK';
        this.views.chartView.trigger('error', error);
      }
      else {
        this.fetchData();
      }
    }

  });

  return EmbedView;
});
