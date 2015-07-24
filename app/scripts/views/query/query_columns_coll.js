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
      this.instanciateColumns();
      this.setListeners();
    },

    setListeners: function() {
      this.appEvents.on('queryTables:change', function() {
        this.toggleVisible();
        this.render();
        this.fetchData();
      }, this);
      this.appEvents.on('queryChart:change', function() {
        /* We delete the previous columns */
        _.each(this.views, function(view) {
          /* We free the memory */
          view.destroy();
          view = null;
        });
        this.resetViews();
        /* And we create the new ones */
        this.instanciateColumns();
        this.render();
      }, this);
    },

    instanciateColumns: function() {
      _.each(Config.charts[fc.get('graph')].columns, function(name) {
        var column = Config.columns[name];
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
    },

    toggleVisible: function() {
      return this.visible = fc.get('table') !== undefined;
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
    }

  });

  return QueryColumnsCollectionView;

});
