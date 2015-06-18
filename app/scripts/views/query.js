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
      this.visible = false;
      this.setListeners();
    },

    setListeners: function() {
      this.appEvents.on('account:change', function() {
        this.toggleVisible();
        this.render();
        this.views.tablesView.fetchData();
      }, this);
      this.appEvents.on('account:reset', function() {
        this.toggleVisible();
        /* We delete all the instances of the query subviews */
        _.each(this.views, function(view) {
          view.destroy();
        });
        /* We need to remove the event listeners so the order of the call backs
           would be restored as when this view was created */
        this.appEvents.off(null, null, this);
        /* We recreate new instances */
        this.views = {};
        this.addView({ tablesView:  new QueryTablesView() });
        this.addView({ chartView:   new QueryChartView() });
        /* We re-set initializeColumnsOnce in order to can call it once, once
           again */
        this.initializeColumnsOnce = _.once(function() {
          this.initializeColumns();
        });
        /* We set back the listeners here after the ones of the subviews */
        this.setListeners();
        this.render();
      }, this);
      this.appEvents.on('query:validate', _.debounce(this.allowSubmit, 200),
        this);
      this.appEvents.on('queryChart:change', function() {
        this.initializeColumnsOnce();
      }, this);
    },

    /**
     * Calls once initializeColumns
     */
    initializeColumnsOnce: _.once(function() {
      this.initializeColumns();
    }),

    /**
     * Creates the instance of the ColumnsCollection view when the chart type
     * is set, then the view is in charge of updating itself
     */
    initializeColumns: function() {
      this.addView({ columnsView: new QueryColumnsCollectionView() });
      this.render();
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
        if(this.views.hasOwnProperty(viewName)) {
          var view = this.views[viewName];
          if(!view.isValid()) {
            isValid = false;
            break;
          }
        }
      }
      this.$queryBtn.prop('disabled', !isValid);
      if(isValid && fc.get('autoRender')) {
        this.appEvents.trigger('chart:render');
      }
    },

    /**
     * Renders the chart and the data table
     * @param  {Object} e the submit event
     */
    onSubmit: function(e) {
      e.preventDefault();
      this.appEvents.trigger('chart:render');
    },

    afterRender: function() {
      this.$queryBtn = this.$el.find('#queryBtn');
      this.$queryBtn.off('click').on('click', _.bind(this.onSubmit, this));
    }

  });

  return QueryView;

});
