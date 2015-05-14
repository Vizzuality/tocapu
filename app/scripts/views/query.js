/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'handlebars',
  'facade',
  'config',
  'helpers/utils',
  'collections/tables',
  'collections/columns',
  'views/columns_coll',
  'text!templates/query.handlebars',
  'text!sql/tables.pgsql',
  'text!sql/columns.pgsql'
], function(_, Backbone, Handlebars, fc, Config, Utils,
  TablesCollection, ColumnsCollection,
  ColumnsCollectionView, TPL, tablesSQL, columnsSQL) {

  'use strict';

  var QueryView = Backbone.View.extend({

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
      Backbone.Events.on('query:validate', this.validateForm, this);
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
        _.each(Config.columns, function(column, name) {
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
        this.setGraphType();
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
          this.setGraphType();
        }

        /* The saved table's name doesn't exist (anymore) */
        else {
          this.$el.find('#table').addClass('is-wrong');
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

        this.retrieveColumns();

        /* We update the available columns' options */
        if(this.columns) {
          this.columns.updateValue();
        }
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

          this.retrieveColumns();
        }
        else { /* Unable to find that graph type */
          this.$el.find('#chart').addClass('is-wrong');
          /* TODO */
        }
      }

      /* We set the default value */
      else {
        this.graphType = $('#chart').val();
        fc.set('graph', this.graphType);
        Backbone.Events.trigger('route:update');

        this.retrieveColumns();
      }
    },

    /**
     * Initializes the columns views if not instanciated, updates their
     * collection otherwise
     */
    initColumns: function() {
      if(!this.columns) {
        this.columns = new ColumnsCollectionView({
          collection: this.columnsCollection
        });

        // We restore the columns
        var restoreColumns = false;
        for(var name in Config.columns) {
          if(fc.get(name)) {
            restoreColumns = true;
            break;
          }
        }
        if(restoreColumns) { this.columns.updateValue(); }
      }
      /* We update the columns' collections */
      this.columns.setCollection(this.columnsCollection);

      this.renderColumns();
    },

    /**
     * Renders the columns inputs
     */
    renderColumns: function() {
      this.columns.render();

      /* We validate the form in case of, when restoring, all the fields have
         been filled */
      if(this.validateForm() && this.columns.isRestored()) {
        this.renderData();
      }
    },

    /**
     * Enables the submit buttons depending on the other inputs values
     * @return {Boolean} return true if the form is entirely filled
     */
    validateForm: function() {
      var isValid = $('#query').val() !== '---' || $('#table').val() !== '---';
      isValid &= (this.columns) ? this.columns.isValid() : false;

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
      fc.set('columnsName', this.columns.getValues());

      Backbone.Events.trigger('data:retrieve');
    }

  });

  return QueryView;

});
