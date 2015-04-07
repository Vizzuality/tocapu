define([
  'backbone',
  'handlebars',
  'text!templates/datatable.handlebars'
], function(Backbone, Handlebars, tpl) {

  'use strict';

  var DataTableView = Backbone.View.extend({

    template: Handlebars.compile(tpl),

    initialize: function(settings) {
      this.options = settings.options || {};
      this.data = settings.data;

      this.render();
    },

    render: function() {
      this.$el.html(this.template({ data: this.data }));
      return this;
    }

  });

  return DataTableView;

});
