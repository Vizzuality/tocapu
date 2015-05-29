define([
  'underscore',
  'backbone',
  'backbone-super',
  'views/abstract/base',
  'views/abstract/input',
  'views/abstract/select',
  'views/query/query_tables',
  'views/query/query_chart',
  'views/query/query_columns_coll',
  'facade',
  'text!templates/query.handlebars'
], function(_, Backbone, bSuper, BaseView, InputView, SelectView,
  QueryTablesView, QueryChartView, QueryColumnsCollectionView, fc, TPL) {

  'use strict';

  var QueryView = BaseView.extend({

    template: TPL,

    initialize: function() {
      this.addView({ tablesView:  new QueryTablesView() });
      this.addView({ chartView:   new QueryChartView() });
      this.addView({ columnsView: new QueryColumnsCollectionView() });
      this.visible = false;
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('account:change', function() {
        this.toggleVisible();
        this.render();
        this.views.tablesView.fetchData();
      }, this);
      Backbone.Events.on('account:reset', function() {
        this.toggleVisible();
        _.each(this.views, function(view) { view.reset(); });
        this.render();
      }, this);
      Backbone.Events.on('query:validate', _.debounce(this.allowSubmit, 200)
        , this);
    },

    serialize: function() {
      if(this.visible) { return { visible: true }; }
      else { return {}; }
    },

    /**
     * Toggles the visibility of the view's template
     * @return {Boolean} true if visible, false otherwise
     */
    toggleVisible: function() {
      return this.visible = fc.get('account') !== undefined;
    },

    allowSubmit: function() {
      var isValid = true;
      for(var viewName in this.views) {
        var view = this.views[viewName];
        if(!view.isValid()) {
          isValid = false;
          break;
        }
      }
      this.$queryBtn.prop('disabled', !isValid);
    },

    /**
     * Renders the chart and the data table
     * @param  {Object} e the submit event
     */
    onSubmit: function(e) {
      e.preventDefault();
      console.log('render chart');
    },

    afterRender: function() {
      this.$queryBtn = this.$el.find('#queryBtn');
      this.$queryBtn.on('click', _.bind(this.onSubmit, this));
    },

    reset: function(e) {
      // e.preventDefault();
      // this.username = undefined;
      // this.views.inputView.set({ value: undefined });
      // fc.unset('account');
      // Backbone.Events.trigger('route:update');
      // Backbone.Events.trigger('account:reset');
      // this.render();
    }

  });

  return QueryView;

});
