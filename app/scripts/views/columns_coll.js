define([
  'backbone',
  'underscore',
  'handlebars',
  'facade',
  'config',
  'views/columns_item'
], function(Backbone, _, Handlebars, fc, Config, ColumnsItemView) {

  'use strict';

  var ColumnsCollectionView = Backbone.View.extend ({

    initialize: function(options) {
      this.columns = {};
      this.collection = options.collection || {};

      _.each(Config.columns, function(column, name) {
        this.columns[name] = new ColumnsItemView({
          el: column.el,
          collection: this.collection,
          options: {
            name:  name,
            label: column.label,
          }
        });
      }, this);
    },

    /**
     * Sets the collection to the columns
     * @param {Object} collection Backbone.Collection
     */
    setCollection: function(collection) {
      this.collection = collection;
      _.each(Config.columns, function(column, name) {
        this.columns[name].setCollection(this.collection);
      }, this);
    },

    /**
     * Asks each column to update/refresh its options and the selected one
     */
    updateValue: function() {
      var columns = {};
      if(fc.get('graph')) {
        columns = Config.charts[fc.get('graph')].columns;
      }
      else {
        columns = Config.columns;
      }

      _.each(columns, function(name) {
        this.columns[name].setValue();
      }, this);
    },

    /**
     * Renders the columns which correspond to the graph's type
     */
    render: function() {
      _.each(Config.charts[fc.get('graph')].columns, function(name) {
        this.columns[name].render();
        if(fc.get(name)) { this.columns[name].setValue(); }
      }, this);
    },

    /**
     * Checks if the columns have valid values
     * @return {Boolean} true if valid
     */
    isValid: function() {
      var res = true;
      _.each(Config.charts[fc.get('graph')].columns, function(name) {
        res = res && this.columns[name].getValue() !== undefined;
        res = res && !this.columns[name].hasError;
      }, this);
      return res;
    },

    /**
     * Returns true if any of the current columns has a restored value
     * @return {Boolean} true if restored
     */
    isRestored: function() {
      var res = false;
      _.each(Config.charts[fc.get('graph')].columns, function(name) {
        if(this.columns[name].hasRestoredValue) {
          res = true;
        }
      }, this);
      return res;
    },

    /**
     * Returns an object whose keys are the columns names and the values, their
     * current values
     * @return {Object} the columns names and values
     */
    getValues: function() {
      var res = {};
      _.each(Config.charts[fc.get('graph')].columns, function(name) {
        res[name] = this.columns[name].getValue();
      }, this);
      return res;
    }

  });

  return ColumnsCollectionView;

});
