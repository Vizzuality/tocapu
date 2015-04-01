define([
  'underscore',
  'backbone',
  'handlebars',
  'collections/tables',
  'collections/columns',
  'views/columns',
  'text!templates/query.handlebars',
  'text!sql/tables.pgsql',
  'text!sql/columns.pgsql'
], function(_, Backbone, Handlebars,
  TablesCollection, ColumnsCollection,
  ColumnsView, tpl, tablesSQL, columnsSQL) {

  'use strict';

  var QueryView = Backbone.View.extend({

    events: {
      'keyup textarea': 'checkSQL',
      'change #table': 'showColumns',
      'change #chart': 'updateColumns',
      'change input, select': 'validateForm',
      'submit form': 'renderChart'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      _.bindAll(this, 'showTables', 'render', 'validateForm');
      this.collection = new TablesCollection();
    },

    setListeners: function() {
      this.listenTo(this.xColumn, 'column:change', function(d) { this.updateColumn(this.yColumn, d); });
      this.listenTo(this.yColumn, 'column:change', function(d) { this.updateColumn(this.xColumn, d); });
    },

    /**
     * Show tables when user type account
     * @param  {Object} account Backbone.Model
     */
    showTables: function(account) {
      this.account = account;
      if (account.attributes.username) {
        this.collection
          .setUsername(account.attributes.username)
          .fetch({ data: {q: tablesSQL} })
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
      this.$el.find('.table-input').prop('disabled', function() { return value !== ''; });

      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(this.validateForm, 300);
    },

    showColumns: function(e) {
      var columns = new ColumnsCollection();
      this.xColumn = new ColumnsView({
        el: '#xColumn',
        collection: columns,
        options: { axis: 'x' }
      });
      this.yColumn = new ColumnsView({
        el: '#yColumn',
        collection: columns,
        options: { axis: 'y' }
      });
      var sql = Handlebars.compile(columnsSQL)({
        table: e.currentTarget.value
      });

      columns
        .setUsername(this.account.attributes.username)
        .fetch({ data: { q: sql } })
        .done(_.bind(function() {
          this.xColumn.render();
          this.yColumn.render();
          this.updateColumns();
        }, this));

      this.setListeners();
    },

    updateColumn: function(column, options) {
      this.updateColumns();
      column.disableValue(options.value);
    },

    updateColumns: function() {
      this.xColumn.resetDisabledValues();
      this.yColumn.resetDisabledValues();

      switch($('#chart').val()) {
        case 'scatter':
          this.xColumn.disableNonNumericalValues();
          this.yColumn.disableNonNumericalValues();
          break;

        default: /* TODO: verify other types of graph */
          break;
      };
    },

    validateForm: function() {
      var valid  =  $('#query').val()       !== ''    || $('#table').val() !== '---';   /* query or table chose */
          valid &=  this.xColumn.getValue() !== '---' && this.yColumn.getValue() !== '---'; /* axis chose */
          valid &=  this.xColumn.getValue() !== this.yColumn.getValue();                    /* different axis */

      switch($('#chart').val()) {
        case 'scatter':
          valid &=  this.xColumn.isNumerical() && /* scatter axis are numbers */
                    this.yColumn.isNumerical();
          break;

        default: /* TODO: verify other types of graph */
          break;
      };

      $('#queryBtn').prop('disabled', !valid);
    },

    renderChart: function(e) {
      e.preventDefault();
      var options = {
        table:    $('#table').val(),
        xColumn:  this.xColumn.getValue(),
        yColumn:  this.yColumn.getValue(),
        type:     'scatter'
      };
      this.trigger('chart:render', options);
    }

  });

  return QueryView;

});
