/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'handlebars',
  'facade',
  'helpers/utils',
  'collections/tables',
  'collections/columns',
  'views/columns',
  'text!templates/query.handlebars',
  'text!sql/tables.pgsql',
  'text!sql/columns.pgsql'
], function(_, Backbone, Handlebars, fc, Utils,
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
      'change #table': 'setTable',
      'change #chart': 'setGraphType',
      'change input, select': 'validateForm',
      'submit form': 'renderData'
    },

    template: Handlebars.compile(TPL),

    initialize: function() {
      this.tablesCollection = new TablesCollection();

      _.bindAll(this, 'render','setTable', 'initColumns', 'renderColumns',
        'validateForm');
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('account:change', this.retrieveTables, this);
    },

    /**
     * Fetches the tables names from CartoDB or resets the sidebar if no account
     * is set
     */
    retrieveTables: function() {
      /* The user just entered an account's name */
      if(fc.get('account')) {
        this.tablesCollection
          .fetch({ data: {q: tablesSQL} })
          .done(_.bind(function() {
            this.render();
            if(fc.get('table')) { this.setTable(); }
          }, this))
          .error(function() {
            Backbone.Events.trigger('account:error');
          });
      }
      /* The user asks to switch to another account */
      else {
        this.tablesCollection.reset();
        this.render();
      }
    },

    /**
     * Renders the sidebar and triggers an account:success event
     */
    render: function() {
      Backbone.Events.trigger('account:success');

      var tables = this.tablesCollection.length > 0 ?
        this.tablesCollection.toJSON() : null;
      this.$el.html(this.template({ tables: tables }));

      /* If the columns already have been instanciated, we need to update their
         el and $el elements */
      if(this.columns) {
        _.each(this.config.columns, function(column, name) {
          this.columns[name].setElement(column.el);
        }, this);
      }

      return this;
    },

    /* TODO */
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

    /**
     * Saves the table's name choice or restores it
     * @param {Object} e optional the event attached to the input change
     */
    setTable: function(e) {
      /* We retrieve the user's choice and set it */
      if(e) {
        fc.set('table', e.currentTarget.value);
        Backbone.Events.trigger('route:update');

        /* We remove the columns choices and retrieve the new ones */
        this.resetColumns();
        this.retrieveColumns();
      }

      /* We restore the choice of table from the facade */
      else {
        /* We verify if the table exists */
        var tableExists = this.tablesCollection.where({
          'cdb_usertables': fc.get('table')
        }).length === 1;

        /* Everything's fine */
        if(tableExists) {
          Utils.toggleSelected(this.$el.find('#table'), fc.get('table'));
          this.retrieveColumns();
        }

        /* The saved table's name doesn't exist (anymore) */
        else {
          console.log('wrong table');
          /* TODO */
        }
      }
    },

    /**
     * Fetches from the server the table's columns
     * @return {[type]} [description]
     */
    retrieveColumns: function() {
      var sql = Handlebars.compile(columnsSQL) ({
        table: fc.get('table')
      });

      /* Shared data between the columns views */
      this.columnsCollection = new ColumnsCollection();

      this.columnsCollection
        .fetch({ data: { q: sql } })
        .done(this.initColumns);
        /* TODO: error case */
    },

    /**
     * Updates the graph's type or restores it
     * @param  {Object} e optional the event associated to the graph type input
     */
    setGraphType: function(e) {
      if(e) {
        this.graphType = e.currentTarget.value;
        fc.set('graph', this.graphType);
        Backbone.Events.trigger('route:update');

        /* We delete all the columns from the DOM */
        this.resetColumns();
      }

      /* We restore the saved value */
      else if(fc.get('graph')) {
        /* We verify that it exists */
        var savedGraphType = fc.get('graph'),
            graphTypeExists = this.$el
              .find('#chart option[value='+savedGraphType+']').length === 1;

        /* We make the restored type graph the selected value of the input */
        if(graphTypeExists) {
          Utils.toggleSelected(this.$el.find('#chart'), savedGraphType);
          this.graphType = savedGraphType;
          /* If fc.get('graph') exists, there's no need to update the URL as it
             already is part of it */
        }
        else { /* Unable to find that graph type */
          console.log('wrong graph type');
          /* TODO */
        }
      }

      /* We set the default value */
      else {
        this.graphType = $('#chart').val();
        fc.set('graph', this.graphType);
        Backbone.Events.trigger('route:update');
      }
    },

    /**
     * Initializes the columns views if not instanciated, updates their
     * collection otherwise
     */
    initColumns: function() {
      if(!this.columns) {
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
      else { /* We update the columns' collections */
        _.each(this.config.columns, function(column, name) {
          this.columns[name].setCollection(this.columnsCollection);
        }, this);
      }

      this.renderColumns();
    },

    /**
     * Resets the columns
     */
    resetColumns: function() {
      if(this.columns) {
        _.each(this.config.charts[this.graphType].columns,
          function(columnName) {
          this.columns[columnName].reset();
        }, this);
        this.renderColumns();
      }
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
      this.setGraphType();

      /* We only render the enabled columns depending on the graph type */
      _.each(this.config.charts[this.graphType].columns, function(columnName) {
        var options = this.config.charts[this.graphType].dataType;
        this.columns[columnName].render();
        this.columns[columnName].updateOptions(options);
      }, this);

      /* We restore the column's value if available
         This needs the columns to be ALREADY rendered */
      var isRestored = false;
      _.each(this.config.charts[this.graphType].columns, function(columnName) {
        if(fc.get(columnName)) {
          this.columns[columnName].setValue();
          isRestored = true;
        }
      }, this);

      /* We validate the form in case of, when restoring, all the fields have
         been filled */
      if(isRestored && this.validateForm()) {
        this.renderData();
      }
    },

    /**
     * Enables the submit buttons depending on the other inputs values
     * @return {Boolean} return true if the form is entirely filled
     */
    validateForm: function() {
      var isValid = $('#query').val() !== '---' || $('#table').val() !== '---';
      var columns = this.columns;

      if(columns) { /* Columns are instanciated when the user chooses a table */
        _.each(this.config.charts[this.graphType].columns,
          function(columnName) {

          isValid &= columns[columnName].getValue() &&
            columns[columnName].getValue() !== '---';
        }, this);
      }
      else {
        isValid = false;
      }

      $('#queryBtn').prop('disabled', !isValid);

      return isValid;
    },

    /**
     * Saves the application's parameters and triggers the data retrieving
     * @param  {Object} e optional the event object associated to the
     *                             submit button
     */
    renderData: function(e) {
      if(e) { e.preventDefault(); }

      /* We retrieve the data */
      var columns = {};
      _.each(this.config.charts[this.graphType].columns, function(columnName) {
        columns[columnName] = this.columns[columnName].getValue();
      }, this);
      fc.set('columnsName', columns);

      Backbone.Events.trigger('data:retrieve');
    }

  });

  return QueryView;

});
