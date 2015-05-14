define([
  'backbone',
  'underscore',
  'handlebars',
  'facade',
  'config',
  'helpers/utils',
  'collections/columns',
  'text!templates/columns.handlebars'
], function(Backbone, _, Handlebars, fc, Config, Utils, ColumnsCollection,
  tpl) {

  'use strict';

  var ColumnsView = Backbone.View.extend({

    events: {
      'change select': '_pickOption'
    },

    template: Handlebars.compile(tpl),

    initialize: function(settings) { // TODO rename private
      this.options = settings.options || {};
      this._currentOption = undefined;
      this.hasRestoredValue = false;
      this.hasError = false;
      Backbone.Events.on('columns:update', this.render, this);
    },


    /**
     * Sets a new collection to the view
     * @param {Object} collection Backbone.Collection
     */
    setCollection: function(collection) {
      this._collection = collection;
    },

    /**
     * Returns the data associated to an option
     * @param  {String}          name the option's name/value
     * @return {Boolean||Object}      the option's data if found, false
     *                                otherwise
     */
    _getOption: function(name) {
      var data = this._collection.models,
          res  = false;

      for(var i = 0; i < data.length; i++) {
        if(data[i].attributes.name === name) {
          res = data[i].attributes;
          break;
        }
      }
      return res;
    },

    /**
     * Gives the column an error state and renders it
     * @param {String} message the error message
     *                         if !message, removes the error state
     */
    _displayError: function(message) {
      this.hasError = !(!message);
      this.errorMessage = message || undefined;
      if(!message) {
        this.render();
        fc.unset(this.options.name);
        Backbone.Events.trigger('route:update');
      }
    },

    /**
     * Restores the value stored in the facade
     * Expects this.options.name and fc.get(this.options.name) to be set
     */
    restoreOption: function() {
      var option = this._getOption(fc.get(this.options.name));

      /* The column's name couln't be find */
      if(!option) {
        this._displayError('Unable to retrieve the selected column');
        return;
      }

      /* The option isn't compatible with the graph's type */
      if(Config.charts[fc.get('graph')].dataType.indexOf(option.type) ===
          -1) {
        this._displayError('The column\'s type is not compatible with the ' +
          'graph\'s type');
        return;
      }

      /* The option is already taken by another column */
      if(option.disabled && option.name !== this._currentOption) {
        this._displayError('The column is already in use');
        return;
      }

      /* In case the restored option didn't throw an error, we execute the
         following instruction */
      this.setValue(fc.get(this.options.name));
      this.hasRestoredValue = true;
    },

    /**
     * Returns the current selected option value
     */
    getValue: function() {
      return this._currentOption;
    },

    /**
     * Sets a specific value/option to the select input, asks the other columns
     * to update and implicity renders
     * @return {Boolean||String} false if the option couldn't be found, the
     *                           value otherwise
     */
    setValue: function(value) {
      var newOption = this._getOption(value);
      if(!newOption) { return false; }

      /* We save the new option */
      if(this._currentOption) {
        var oldOption = this._getOption(this._currentOption);
        if(oldOption) { oldOption.disabled = false; }
      }
      newOption.disabled = true;
      this._currentOption = value;
      fc.set(this.options.name, this._currentOption);

      /* We delete the possible previous errors */
      this._displayError(false);

      /* We save the option inside the URL */
      Backbone.Events.trigger('route:update');

      /* We ask the other columns to update
         We don't need to render here as we're calling ourselves with this
         event */
      Backbone.Events.trigger('columns:update');

      return value;
    },

    /**
     * Sets the default option of the input or restores it
     * @param {Object} e optional the event's object from the user's click
     */
    _pickOption: function(e) {
      this.setValue(e.currentTarget.value);
      this.hasRestoredValue = false;
    },

    /**
     * Renders the input and asks the dashboard to validate
     * Expects fc.get('graph') to be set
     */
    render: function() {
      var params = {
        name:          this.options.name,
        label:         this.options.label,
        currentOption: this._currentOption,
        columns:       this._collection.toJSON(),
        hasError:      this.hasError,
        error:         this.errorMessage,
        acceptedData:  Config.charts[fc.get('graph')].dataType
      };

      this.$el.html(this.template(params));
      Backbone.Events.trigger('query:validate');

      return this;
    }

  });

  return ColumnsView;

});
