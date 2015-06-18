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
      /* Needs to be in the init function so when deleting and recreating this
         view, we still would able to call once restore */
      this.restoreOnce = _.once(function() { this.restore(); });
      this.setListeners();
    },

    setListeners: function() {
      this.appEvents.on('account:change', function() {
        this.visible = true;
      }, this);
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

    afterRender: function() {
      if(this.visible) { this.restoreOnce(); }
    },

    beforeDestroy: function() {
      this._super();
      fc.unset('graph');
      this.appEvents.trigger('route:update');
    }

  });

  return QueryChartView;

});
