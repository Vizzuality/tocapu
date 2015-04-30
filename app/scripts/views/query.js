/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'handlebars',
  'facade',
  'collections/tables',
  'collections/columns',
  'views/columns',
  'text!templates/query.handlebars',
  'text!sql/tables.pgsql',
  'text!sql/columns.pgsql'
], function(_, Backbone, Handlebars, fc,
  TablesCollection, ColumnsCollection,
  ColumnsView, TPL, tablesSQL, columnsSQL) {

  'use strict';

  var QueryView = Backbone.View.extend({

    config: {
      columns: {
        x:       { el: '#xColumn', label: 'Axis x' },
        y:       { el: '#yColumn', label: 'Axis y' }
      },

      charts: {
        scatter: {
          columns: ['x', 'y'],
          dataType: ['number']
        },
        pie: {
          columns: ['x', 'y'],
          dataType: ['string', 'number', 'geometry', 'date', 'boolean']
        },
        byCategory: {
          columns: ['x', 'y'],
          dataType: ['string', 'number', 'geometry', 'date', 'boolean']
        },
        timeline: {
          columns: ['x', 'y'],
          dataType: ['string', 'number', 'geometry', 'date', 'boolean']
        }
      }
    },

    events: {
      'keyup textarea': 'checkSQL',
      'change #table': 'initColumns',
      'change #chart': 'updateGraphType',
      'change input, select': 'validateForm',
      'submit form': 'renderData'
    },

    template: Handlebars.compile(TPL),

    initialize: function() {
      this.tablesCollection = new TablesCollection();

      _.bindAll(this, 'showTables', 'render', 'validateForm');
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('accountName:change', _.bind(this.showTables, this));
    },

    /**
     * Show tables when user type account
     * @param  {Object} account Backbone.Model
     */
    showTables: function() {
      this.accountName = fc.get('accountName');
      if (this.accountName) {
        this.tablesCollection
          .fetch({ data: {q: tablesSQL} })
          .done(this.render);
      }
      else {
        this.tablesCollection.reset();
        this.render();
      }
    },

    render: function() {
      var tables = this.tablesCollection.length > 0 ?
        this.tablesCollection.toJSON() : null;
      this.$el.html(this.template({ tables: tables }));
      return this;
    },

    checkSQL: function(e) {
      var value = e.currentTarget.value;
      this.$el.find('.table-input').prop('disabled', function() {
        return value !== '';
      });
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(this.validateForm, 300);
    },

    initColumns: function(e) {
      /* We save the type of graph */
      this.graphType = $('#chart').val();
      fc.set('graphType', this.graphType);

      if(!this.columns) {
        /* Shared data between the columns views */
        this.columnsCollection = new ColumnsCollection();

        /* We instantiate all the columns views */
        this.columns = {};
        _.each(this.config.columns, function(column, name) {
          this.columns[name] = new ColumnsView({
            el: column.el,
            collection: this.columnsCollection,
            options: {
              name:  name,
              label: column.label,
            }
          });

          /* We also listen the change of their values */
          this.columns[name].on('change', this.updateOptions, this);
        }, this);
      }

      var sql = Handlebars.compile(columnsSQL)({
        table: e.currentTarget.value
      });

      // fc.get('columnsData')
      this.columnsCollection
        .fetch({ data: { q: sql } })
        .done(_.bind(function() {
          this.renderColumns();
        }, this));
    },

    /**
     * Updates the list of options available in the columns inputs
     * @param  {Object} updatedColumn Backbone.Model
     */
    updateOptions: function(updatedColumn) {
      var columns = this.columns;
      _.each(this.config.charts[this.graphType].columns, function(columnName) {
        if(updatedColumn !== columns[columnName]) {
          columns[columnName].enableOption(updatedColumn.getPreviousValue());
          columns[columnName].disableOption(updatedColumn.getValue());
        }
      });
    },

    /**
     * Renders the columns inputs
     */
    renderColumns: function() {
      var columns = this.columns;
      /* We only render the enabled columns depending on the graph type */
      _.each(this.config.charts[this.graphType].columns, function(columnName) {
        var options = this.config.charts[this.graphType].dataType;
        columns[columnName].render();
        columns[columnName].updateOptions(options);
      }, this);
    },

    /**
     * Updates the graph type and reset the columns inputs
     * @param  {Object} e the event associated to the graph type input
     */
    updateGraphType: function(e) {
      /* We delete all the columns from the DOM */
      _.each(this.config.charts[this.graphType].columns, function(columnName) {
        this.columns[columnName].reset();
      }, this);

      this.graphType = e.currentTarget.value;
      fc.set('graphType', this.graphType);
      this.renderColumns();
    },

    /**
     * Enables the submit buttons depending on the other inputs values
     */
    validateForm: function() {
      var isValid = $('#query').val() !== '---' || $('#table').val() !== '---';
      var columns = this.columns;
      _.each(this.config.charts[this.graphType].columns, function(columnName) {
        isValid &= columns[columnName].getValue() &&
          columns[columnName].getValue() !== '---';
      }, this);

      $('#queryBtn').prop('disabled', !isValid);
    },

    /**
     * Saves the application's parameters and triggers the data retrieving
     * @param  {Object} e the event object associated to the submit button
     */
    renderData: function(e) {
      e.preventDefault();

      /* We retrieve the data */
      var columns = {};
      _.each(this.config.charts[this.graphType].columns, function(columnName) {
        columns[columnName] = this.columns[columnName].getValue();
      }, this);
      fc.set('columnsName', columns);
      fc.set('tableName', $('#table').val());
      Backbone.Events.trigger('data:retrieve');
    }

  });

  return QueryView;

});
