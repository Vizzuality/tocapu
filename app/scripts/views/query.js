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
      'keyup textarea': 'checkSQL'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      _.bindAll(this, 'showTables', 'render');
      this.collection = new TablesCollection();
    },

    showTables: function(model) {
      this.collection
        .setUsername(model.attributes.username)
        .fetch({ data: {q: sql} })
        .done(this.render);
    },

    render: function() {
      this.$el.html(this.template({ tables: this.collection.toJSON() }));
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

    disableInputs: function() {
      this.$el.find('.table-input').prop('disabled', true);
    },

    enableInputs: function() {
      this.$el.find('.table-input').prop('disabled', false);
    }

  });

  return QueryView;

});
