define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'facade',
  'views/abstract/base',
  'views/abstract/select',
  'collections/query/query_tables',
  'text!sql/tables.pgsql',
  'text!templates/query/query_tables.handlebars'
], function(_, Backbone, bSuper, Handlebars, fc, BaseView, SelectView,
  QueryTablesCollection, SQL, TPL) {

  'use strict';

  var QueryTablesView = SelectView.extend({

    el: '.tables',

    template: TPL,

    collection: new QueryTablesCollection(),

    events: {
      'change select': '_pickOption'
    },

    serialize: function() {
      if(this.error) { return { error: this.error }; }
      return this._super();
    },

    setValue: function(value) {
      var res = this._super(value);
      if(res === value) {
        fc.set('table', value);
        this.appEvents.trigger('route:update');
        this.appEvents.trigger('queryTables:change');
        this.appEvents.trigger('query:validate');
      }
      else {
        this.render();
      }
      return res;
    },

    /**
     * Fetches the data to fill the select input
     */
    fetchData: function() {
      this.$el.addClass('is-loading');
      this.error = undefined;
      this.collection.fetch({ data: { q: SQL } })
        .done(_.bind(function() {
          if(fc.get('table')) {
            if(this.setValue(fc.get('table')) !== fc.get('table')) {
              this.render(); /* We need to manually render */
            }
          }
        }, this))
        .fail(_.bind(function() {
          this.error = 'Unable to retrieve the tables';
          this.render();
        }, this))
        .always(_.bind(function() {
          this.$el.removeClass('is-loading');
        }, this));
    },

    beforeDestroy: function() {
      this._super();
      fc.unset('table');
      this.appEvents.trigger('route:update');
    }

  });

  return QueryTablesView;

});
