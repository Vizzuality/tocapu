define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'facade',
  'config',
  'views/abstract/base',
  'views/abstract/select',
  'text!templates/query/query_chart.handlebars'
], function(_, Backbone, bSuper, Handlebars, fc, Config, BaseView, SelectView,
  TPL) {

  'use strict';

  var QueryChartView = SelectView.extend({

    el: '.chart-type',

    template: TPL,

    collection: new Backbone.Collection(),

    events: {
      'change select': '_pickOption'
    },

    initialize: function() {
      this._super();
      this.collection.set(_.map(Config.charts, function(o, value) {
        return { name: o.name, value: value };
      }));
    },

    _pickOption: function(e) {
      this._super(e);
      fc.set('graph', this.getValue());
      Backbone.Events.trigger('route:update');
    },

    /* Override */
    _getOption: function(value) {
      var res = this.collection.where({ value: value });
      return res.length > 0 ? res[0].attributes : undefined;
    },

    restore: _.once(function() {
      if(fc.get('graph')) {
        this.setValue(fc.get('graph'));
      }
    }),

    afterRender: function() {
      this.restore();
    },

    reset: function() {
      this.set({ value: undefined}, { silent: true });
      fc.unset('graph');
      Backbone.Events.trigger('route:update');
    }

  });

  return QueryChartView;

});
