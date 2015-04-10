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
], function(_, Backbone, Handlebars, Facade,
  TablesCollection, ColumnsCollection,
  ColumnsView, TPL, tablesSQL, columnsSQL) {

  'use strict';

  var QueryView = Backbone.View.extend({

    options: {
      columns: {
        x:       { el: '#xColumn',       label: 'Axis x' },
        y:       { el: '#yColumn',       label: 'Axis y' },
        density: { el: '#densityColumn', label: 'Density' }
      },

      charts: {
        scatter: {
          columns: ['x', 'y', 'density'],
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
      'submit form': 'renderChart'
    },

    template: Handlebars.compile(TPL),

    initialize: function() {
      this.tablesCollection = new TablesCollection();

      _.bindAll(this, 'showTables', 'render', 'validateForm');
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('accountName:change', this.showTables);
    },

    /**
     * Show tables when user type account
     * @param  {Object} account Backbone.Model
     */
    showTables: function() {
      this.accountName = Facade.get('accountName');
      if (this.accountName) {
        this.tablesCollection
          .setUsername(this.accountName)
          .fetch({ data: {q: tablesSQL} })
          .done(this.render);
      }
      else {
        this.tablesCollection.reset();
        this.render();
      }
    },

    render: function() {
      var tables = this.tablesCollection.length > 0 ? this.tablesCollection.toJSON() : null;
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

    initColumns: function(e) {
      /* We save the type of graph */
      this.graphType = $('#chart').val();

      if(!this.columns) {
        Facade.set('columnsData', new ColumnsCollection()); /* Shared data between the columns views */

        /* We instantiate all the columns views */
        this.columns = {};
        _.each(this.options.columns, function(column, name) {
          this.columns[name] = new ColumnsView({
            el: column.el,
            options: {
              name:  name,
              label: column.label
            }
          });

          /* We also listen the change of their values */
          this.columns[name].on('change', this.updateOptions, this);
        }, this);
      }

      var sql = Handlebars.compile(columnsSQL)({
        table: e.currentTarget.value
      });

      Facade.get('columnsData')
        .setUsername(this.accountName)
        .fetch({ data: { q: sql } })
        .done(_.bind(function() {
          this.renderColumns();
        }, this));
    },

    updateOptions: function(updatedColumn) {
      _.each(this.options.charts[this.graphType].columns, function(columnName) {
        if(updatedColumn !== this.columns[columnName]) {
          this.columns[columnName].enableOption(updatedColumn.getPreviousValue());
          this.columns[columnName].disableOption(updatedColumn.getValue());
        }
      }, this);
    },

    renderColumns: function() {
      /* We only render the enabled columns depending on the graph type */
      _.each(this.options.charts[this.graphType].columns, function(columnName) {
        this.columns[columnName].render();
        this.columns[columnName].updateOptions(this.options.charts[this.graphType].dataType);
      }, this);
    },

    updateGraphType: function(e) {
      /* We delete all the columns from the DOM */
      _.each(this.options.charts[this.graphType].columns, function(columnName) {
        this.columns[columnName].reset();
      }, this);

      this.graphType = e.currentTarget.value;
      this.renderColumns();
    },

    validateForm: function() {
      var isValid = $('#query').val() !== '---' || $('#table').val() !== '---';

      _.each(this.options.charts[this.graphType].columns, function(columnName) {
        isValid &= this.columns[columnName].getValue() && this.columns[columnName].getValue() != '---';
      }, this);

      $('#queryBtn').prop('disabled', !isValid);
    },

    renderChart: function(e) {
      e.preventDefault();
      var options = {
        table:    $('#table').val(),
        xColumn:  this.xColumn.getValue(),
        yColumn:  this.yColumn.getValue(),
        type:     'scatter'
      };
      Backbone.Events.trigger('chart:render');
    }

  });

  return QueryView;

});
