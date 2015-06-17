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
      this.visible = false;
      this.setListeners();
    },

    setListeners: function() {
      this.appEvents.on('account:change', _.bind(function() {
        this.visible = true;
      }, this));
    },

    setValue: function(value) {
      var res = this._super(value);
      if(res === value) {
        fc.set('graph', value);
        this.appEvents.trigger('route:update');
        this.appEvents.trigger('queryChart:change');
        this.appEvents.trigger('query:validate');
      }
      else {
        this.render();
      }
      return res;
    },

    /* Override */
    _getOption: function(value) {
      var res = this.collection.where({ value: value });
      return res.length > 0 ? res[0].attributes : undefined;
    },

    restore: function() {
      if(fc.get('graph')) {
        this.setValue(fc.get('graph'));
      }
      else {
        var defaultValue = _.keys(Config.charts)[0];
        fc.set('graph', this.setValue(defaultValue));
        this.appEvents.trigger('route:update');
      }
    },

    restoreOnce: _.once(function() { this.restore(); }),

    afterRender: function() {
      if(this.visible) { this.restoreOnce(); }
    },

    reset: function() {
      this._super();
      this.set({ value: undefined}, { silent: true });
      fc.unset('graph');
      this.appEvents.trigger('route:update');
      this.visible = false;
      this.restoreOnce = _.once(this.restore);
    }

  });

  return QueryChartView;

});
