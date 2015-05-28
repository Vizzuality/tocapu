define([
  'underscore',
  'backbone',
  'backbone-super',
  'views/abstract/base',
  'views/abstract/input',
  'views/abstract/select',
  'views/columns_item',
  'views/query/query_tables',
  'views/query/query_chart',
  'collections/columns',
  'facade',
  'text!templates/query.handlebars'
], function(_, Backbone, bSuper, BaseView, InputView, SelectView,
  ColumnsCollectionView, QueryTablesView, QueryChartView, ColumnsCollection,
  fc, TPL) {

  'use strict';

  var QueryView = BaseView.extend({

    template: TPL,

    initialize: function() {
      this.addView({ tablesView: new QueryTablesView() });
      this.addView({ chartView: new QueryChartView() });

      // this.columnsCollection = new ColumnsCollection();
      // var columnsCollectionView = new ColumnsCollectionView({
      //   el: '.columns',
      //   collection: this.columnsCollection
      // });
      // this.addView({ columnsCollectionView: columnsCollectionView });

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

    /**
     * Sets the facade's account and logins
     * @param  {Object} e the submit event
     */
    onSubmit: function(e) {
      // e.preventDefault();
      // fc.set('account', this.views.inputView.get('value'));
      // this.login(fc.get('account'));
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
