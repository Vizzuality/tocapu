define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'helpers/utils',
  'views/abstract/base',
  'text!templates/datatable.handlebars'
], function(_, Backbone, bSuper, Handlebars, Utils, BaseView, TPL) {

  'use strict';

  var DataTableView = BaseView.extend({

    el: '#dataTable',

    template: TPL,

    initialize: function() {
      this.collection.on('sync error', this.render, this);
      this.collection.on('request', function() {
        $('.l-table').addClass('is-loading');
      });
      this.on('error', function(err) {
        this.error = err;
        this.render();
      }, this);
    },

    serialize: function() {
      var error = this.error || this.collection.error || undefined;
      if(error) {
        return { error: error };
      }
      return { data: Utils.extractData(this.collection) };
    },

    afterRender: function() {
      $('.l-table').removeClass('is-loading');
    }

  });

  return DataTableView;

});
