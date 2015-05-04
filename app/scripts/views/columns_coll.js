define([
  'backbone',
  'underscore',
  'handlebars',
  'facade',
  'config',
  'views/columns_item'
], function(Backbone, _, Handlebars, fc, Config, ColumnsItemView) {

  'use strict';

  var ColumnsCollectionView = Backbone.View.Extend ({

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
     * @param  {Object} options should contain the type of graph
     */
    updateValue: function(options) {
      var columns = {};
      if(options.graph) {
        columns = Config.charts[options.graph].columns;
      }
      else {
        columns = Config.columns;
      }

      _.each(columns, function(name) {
        this.columns[name].setValue();
      }, this);
    }

  });

  return ColumnsCollectionView;

});
