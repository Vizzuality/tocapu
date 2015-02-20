define([
  'backbone',
  'handlebars',
  'collections/columns',
  'text!templates/columns.handlebars'
], function(Backbone, Handlebars, ColumnsCollection, tpl) {

  'use strict';

  var ColumnsView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    initialize: function(settings) {
      this.options = settings.options || {};
      if (!this.collection) {
        this.collection = new ColumnsCollection();
      }
    },

    render: function() {
      this.$el.html(this.template({
        axis: this.options.axis,
        columns: this.collection.toJSON()
      }));
      return this;
    }

  });

  return ColumnsView;

});
