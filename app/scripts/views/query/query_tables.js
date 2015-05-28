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

    validate: function(o) {
      if(this.error) { return this.error; }
      return this._super(o);
    },

    _pickOption: function(e) {
      this._super(e);
      fc.set('table', this.getValue());
      Backbone.Events.trigger('route:update');
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
            this.setValue(fc.get('table'));
            this.render(); /* In case of an error, we need to manually render */
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

    reset: function() {
      this.collection.reset();
      this.set({ value: undefined}, { silent: true });
      fc.unset('table');
      Backbone.Events.trigger('route:update');
    }

  });

  return QueryTablesView;

});
