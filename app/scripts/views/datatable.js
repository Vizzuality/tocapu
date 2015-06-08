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
      var data = Utils.extractData(this.collection);
      if(!_.isEmpty(data)) { data = this.parseData(data); }
      return { data: data };
    },

    /**
     * Parses the data to be rendered as wished
     * @param  {Object} data
     * @return {Object} the same data set with some transformations
     */
    parseData: function(data) {
      var axis = {
        x: _.findWhere(data.columns, { axis: 'x'}),
        y: _.findWhere(data.columns, { axis: 'y'})
      };

      /* In the case of date data type, we need to make some adjustements to the
         output text */
      if(axis.x && axis.y) {
        _.each(axis, function(o, name) {
          if(o.type === 'date') {
            var pos = name === 'x' ? 0 : 1;
            _.each(data.rows, function(row) {
                row[pos] = Utils.dateToString(row[pos]);
            });
          }
        }, this);
      }

      return data;
    },

    afterRender: function() {
      $('.l-table').removeClass('is-loading');
    }

  });

  return DataTableView;

});
