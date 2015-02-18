define([
  'underscore',
  'backbone',
  'handlebars',
  'collections/tables',
  'text!templates/query.handlebars',
  'text!sql/tables.pgsql'
], function(_, Backbone, Handlebars, TablesCollection, tpl, sql) {

  'use strict';

  var QueryView = Backbone.View.extend({

    events: {
      'keyup textarea': 'checkSQL',
      'change #table': 'showColumns'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      _.bindAll(this, 'showTables', 'render');
      this.collection = new TablesCollection();
    },

    /**
     * Show tables when user type account
     * @param  {Object} account Backbone.Model
     */
    showTables: function(account) {
      if (account.attributes.username) {
        this.collection
          .setUsername(account.attributes.username)
          .fetch({ data: {q: sql} })
          .done(this.render);
      } else {
        this.collection.reset();
        this.render();
      }
    },

    render: function() {
      var tables = this.collection.length > 0 ? this.collection.toJSON() : null;
      this.$el.html(this.template({ tables: tables }));
      return this;
    },

    checkSQL: function(e) {
      var value = e.currentTarget.value;
      if (value === '') {
        this.enableInputs();
      } else {
        this.disableInputs();
      }
    },

    showColumns: function(e) {
      console.info('table: ' + e.currentTarget.value);
    },

    disableInputs: function() {
      this.$el.find('.table-input').prop('disabled', true);
    },

    enableInputs: function() {
      this.$el.find('.table-input').prop('disabled', false);
    }

  });

  return QueryView;

});
