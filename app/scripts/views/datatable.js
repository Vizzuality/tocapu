define([
  'underscore',
  'backbone',
  'handlebars',
  'helpers/utils',
  'text!templates/datatable.handlebars'
], function(_, Backbone, Handlebars, Utils, tpl) {

  'use strict';

  var DataTableView = Backbone.View.extend({

    el: '#dataTable',

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.collection.on('sync', _.bind(this.render, this));
    },

    render: function(collection) {
      var data = Utils.extractData(collection).tableData;
      this.$el.html(this.template({ data: data }));
      return this;
    }

  });

  return DataTableView;

});
