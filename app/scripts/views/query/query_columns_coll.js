define([
  'backbone',
  'backbone-super',
  'underscore',
  'handlebars',
  'facade',
  'config',
  'views/abstract/base',
  'views/query/query_columns_item',
  'collections/query/query_columns',
  'text!sql/columns.pgsql'
], function(Backbone, bSuper, _, Handlebars, fc, Config, BaseView,
  QueryColumnsItemView, QueryColumnsCollection, SQL) {

  'use strict';

  var QueryColumnsCollectionView = BaseView.extend({

    el: '.columns',

    template: (function() {
      var res = '{{#if error}}{{{error}}}{{/if}}' +
        '{{#unless visible}}<div class="is-hidden">{{/unless}}';
      _.each(Config.columns, function(column) {
        res += '<div id="'+column.el.split('#')[1]+'"></div>';
      });
      res += '{{#unless visible}}</div>{{/unless}}';
      return res;
    })(),

    serialize: function() {
      if(this.error) { return { error: this.error, visible: this.visible }; }
      return { visible: this.visible };
    },

    collection: new QueryColumnsCollection(),

    initialize: function() {
      this._columns = {};

      _.each(Config.columns, function(column, name) {
        var instance = new QueryColumnsItemView({
          el: column.el,
          collection: this.collection,
          options: {
            name:  name,
            label: column.label,
          }
        });
        var view = {};
        view[name] = instance;
        this.addView(view);
      }, this);

      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('queryTables:change', _.bind(function() {
        this.toggleVisible();
        this.render();
        this.fetchData();
      }, this));
      Backbone.Events.on('queryChart:change', _.bind(function() {
        /* We revalidate the option choices taking into account the new graph
           type */
        if(this.collection.length > 0) {
          _.each(this.views, function(view) {
            view.setValue(view.getValue());
          }, this);
          this.render();
        }
      }, this));
    },

    toggleVisible: function() {
      return this.visible = fc.get('table') !== undefined;
    },

    reset: function() {
      this.visible = false;
      this.error = undefined;
      _.each(this.views, function(view) { view.reset(); });
      this.collection.reset();
    },

    fetchData: function() {
      this.$el.addClass('is-loading');
      var query = (Handlebars.compile(SQL))({ table: fc.get('table') });
      this.collection.fetch({ data: { q: query } })
        .done(_.bind(function() {
          this.restoreValues();
        }, this))
        .fail(_.bind(function() {
          this.error = 'Unable to retrieve the columns';
          this.render();
        }, this))
        .always(_.bind(function() {
          this.$el.removeClass('is-loading');
        }, this));
    },

    /**
     * Asks each column to restore its options from the facade
     */
    restoreValues: function() {
      _.each(this.views, function(column, columnName) {
        if(fc.get(columnName)) {
          if(column.setValue(fc.get(columnName)) !== fc.get(columnName)) {
            column.render(); /* We need to manually render */
          }
          else {
            column.hasRestoredValue = true;
          }
        }
      }, this);
    },

    // /**
    //  * Validates each column and renders them
    //  */
    // validate: function() {
    //   _.each(this.views, function(column) {
    //     column.validate();
    //   }, this);
    //   this.render();
    // },

    /**
     * Checks if the columns have valid values
     * Expects fc.get('graph') to be set
     * @return {Boolean} true if valid
     */
    isValid: function() {
      var res = true;
      _.each(this.views, function(column) {
        res = res && column.isValid();
      }, this);
      return res;
    },

    // *
    //  * Returns true if any of the current columns has a restored value
    //  * Expects fc.get('graph') to be set
    //  * @return {Boolean} true if restored

    // isRestored: function() {
    //   var res = false;
    //   _.each(this.views, function(column) {
    //     if(column.hasRestoredValue) {
    //       res = true;
    //     }
    //   }, this);
    //   return res;
    // },

    // /**
    //  * Removes the columns 'restored' state
    //  */
    // removeRestoreState: function() {
    //   _.each(this.views, function(column) {
    //     column.hasRestoredValue = false;
    //   });
    // },

    // /**
    //  * Returns an object whose keys are the columns names and the values, their
    //  * current values
    //  * Expects fc.get('graph') to be set
    //  * @return {Object} the columns names and values
    //  */
    // getValues: function() {
    //   var res = {};
    //   _.each(this.views, function(column, name) {
    //     res[name] = column.getValue();
    //   }, this);
    //   return res;
    // }

  });

  return QueryColumnsCollectionView;

});
