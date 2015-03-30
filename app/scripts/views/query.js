define([
  'underscore',
  'backbone',
  'handlebars',
  'collections/tables',
  'collections/columns',
  'views/columns',
  'views/chart',
  'text!templates/query.handlebars',
  'text!sql/tables.pgsql',
  'text!sql/columns.pgsql'
], function(_, Backbone, Handlebars,
  TablesCollection, ColumnsCollection,
  ColumnsView, ChartView, tpl, tablesSQL, columnsSQL) {

  'use strict';

  var QueryView = Backbone.View.extend({

    events: {
      'keyup textarea': 'checkSQL',
      'change #table': 'showColumns',
      'change #xAxis, #yAxis': 'updateColumns',
      'change input, select': 'validateForm',
      'submit form': 'renderChart'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      _.bindAll(this, 'showTables', 'render', 'validateForm');
      this.collection = new TablesCollection();
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
      if (value === '') {
        this.enableInputs();
      } else {
        this.disableInputs();
      }
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(this.validateForm, 300);
    },

    showColumns: function(e) {
      var columns = new ColumnsCollection();
      var xcolumn = new ColumnsView({
        el: '#xColumn',
        collection: columns,
        options: { axis: 'x' }
      });
      var ycolumn = new ColumnsView({
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
        .done(function() {
          xcolumn.render();
          ycolumn.render();
        });
    },

    updateColumns: function(e) {
      var $currentAxis = $(e.currentTarget),
          $otherAxis   = $currentAxis.attr('id') === 'xAxis' ? $('#yAxis') : $('#xAxis'),
          val = e.currentTarget.value;

      $otherAxis.find('option').prop('disabled', function() { return this.value === val; });
    },

    disableInputs: function() {
      this.$el.find('.table-input').prop('disabled', true);
    },

    enableInputs: function() {
      this.$el.find('.table-input').prop('disabled', false);
    },

    validateForm: function() {
      var valid  =  $('#query').val() !== ''    || $('#table').val() !== '---'; /* query or table chose */
          valid &=  $('#xAxis').val() !== '---' && $('#yAxis').val() !== '---'; /* axis chose */
          valid &=  $('#xAxis').val() !== $('#yAxis').val();                    /* different axis */

      $('#queryBtn').prop('disabled', !valid);
    },

    renderChart: function(e) {
      e.preventDefault();
      console.info('render chart!');

      this.chart = new ChartView({
        params: {
          table: $('#table').val(),
          xcolumn: $('#xAxis').val(),
          ycolumn: $('#yAxis').val()
        },
        account: this.account
      });
    }

  });

  return QueryView;

});
