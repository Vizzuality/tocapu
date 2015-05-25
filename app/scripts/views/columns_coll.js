define([
  'backbone',
  'backbone-super',
  'underscore',
  'handlebars',
  'facade',
  'config',
  'views/abstract/base',
  'views/columns_item'
], function(Backbone, bSuper, _, Handlebars, fc, Config, BaseView,
  ColumnsItemView) {

  'use strict';

  var ColumnsCollectionView = BaseView.extend ({

    initialize: function(options) {
      this._columns = {};
      this.collection = options.collection || {};

      _.each(Config.columns, function(column, name) {
        var instance = new ColumnsItemView({
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
    },

    /**
     * Sets the collection to the columns
     * @param {Object} collection Backbone.Collection
     */
    setCollection: function(collection) {
      this.collection = collection;
      _.each(this.views, function(column) {
        column.setCollection(this.collection);
      }, this);
    },

    /**
     * Asks each column to restore its options from the facade
     */
    restoreValues: function() {
      _.each(this.views, function(column, columnName) {
        column.setValue(fc.get(columnName));
        column.hasRestoredValue = true;
      }, this);
    },

    /**
     * Validates each column and renders them
     */
    validate: function() {
      _.each(this.views, function(column) {
        column.validate();
      }, this);
      this.render();
    },

    /**
     * Checks if the columns have valid values
     * Expects fc.get('graph') to be set
     * @return {Boolean} true if valid
     */
    isValid: function() {
      var res = true;
      _.each(this.views, function(column) {
        res = res && column.getValue() !== undefined;
        res = res && column.isValid();
      }, this);
      return res;
    },

    /**
     * Returns true if any of the current columns has a restored value
     * Expects fc.get('graph') to be set
     * @return {Boolean} true if restored
     */
    isRestored: function() {
      var res = false;
      _.each(this.views, function(column) {
        if(column.hasRestoredValue) {
          res = true;
        }
      }, this);
      return res;
    },

    /**
     * Removes the columns 'restored' state
     */
    removeRestoreState: function() {
      _.each(this.views, function(column) {
        column.hasRestoredValue = false;
      });
    },

    /**
     * Returns an object whose keys are the columns names and the values, their
     * current values
     * Expects fc.get('graph') to be set
     * @return {Object} the columns names and values
     */
    getValues: function() {
      var res = {};
      _.each(this.views, function(column, name) {
        res[name] = column.getValue();
      }, this);
      return res;
    }

  });

  return ColumnsCollectionView;

});
