define([
  'backbone',
  'backbone-super',
  'underscore',
  'handlebars',
  'facade',
  'config',
  'helpers/utils',
  'views/abstract/select',
  'collections/columns',
  'text!templates/columns.handlebars'
], function(Backbone, bSuper, _, Handlebars, fc, Config, Utils, SelectView,
  ColumnsCollection, TPL) {

  'use strict';

  var ColumnsView = SelectView.extend({

    events: {
      'change': '_pickOption'
    },

    template: TPL,

    initialize: function(settings) {
      this._super(settings);

      // We check we instantiate with the required information
      if(!this.options.name || !this.options.label) {
        throw new Error('columns_item views must be instantiated with a name ' +
          'and a label');
      }

      this.set({
        name: this.options.name,
        label: this.options.label
      });

      this.hasRestoredValue = false;
      Backbone.Events.on('columns:update', this.render, this);
    },

    /**
     * Returns the data associated to an option
     * @param  {String}          name the option's name/value
     * @return {Boolean||Object}      the option's data if found, undefined
     *                                otherwise
     */
    _getOption: function(name) {
      var res = this.collection.where({ name: name });
      return res.length > 0 ? res[0].attributes : undefined;
    },

    /**
     * Restores the value stored in the facade
     * Expects this.options.name and fc.get(this.options.name) to be set
     */
    // restoreOption: function() {
    //   var option = this._getOption(fc.get(this.options.name));

    //   /* The column's name couln't be find */
    //   if(!option) {
    //     this._displayError('Unable to retrieve the selected column');
    //     return;
    //   }

    //   /* The option isn't compatible with the graph's type */
    //   if(Config.charts[fc.get('graph')].dataType.indexOf(option.type) ===
    //       -1) {
    //     this._displayError('The column\'s type is not compatible with the ' +
    //       'graph\'s type');
    //     return;
    //   }

    //   /* The option is already taken by another column */
    //   if(option.disabled && option.name !== this._currentOption) {
    //     this._displayError('The column is already in use');
    //     return;
    //   }

    //   /* In case the restored option didn't throw an error, we execute the
    //      following instruction */
    //   this.setValue(fc.get(this.options.name));
    //   this.hasRestoredValue = true;
    // },

    /**
     * Returns the current selected option value
     */
    getValue: function() {
      return this.get('value');
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
      if(this.getValue()) {
        var oldOption = this._getOption(this.getValue());
        if(oldOption) { oldOption.disabled = false; }
      }
      newOption.disabled = true;
      this.set({ value: value });
      fc.set(this.options.name, this.getValue());

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
      this._super(e);
      this.hasRestoredValue = false;
    },

    /**
     * Filters the options according to their data types and their availability
     * @param  {Array} options the list of options
     * @return {Array}         the filtered list of options
     */
    _filterOptions: function(options) {
      var acceptedDataTypes = Config.charts[fc.get('graph')].dataType;
      return options.filter(function(option) {
        return acceptedDataTypes.indexOf(option.type) !== -1 &&
          (this.getValue() === option.name || !option.disabled);
      }, this);
    },

    /**
     * Overrides the default serialize method to filter the options according to
     * their data types and their availability
     * @return {Object} the data the template engine needs to render the column
     */
    serialize: function() {
      var res = this._super();
      var options = _.clone(res.options);
      var enabledOptions = this._filterOptions(options);
      var disabledOptions = _.difference(options, enabledOptions);
      _.each(disabledOptions, function(option) { option.disabled = true; });
      res.options = _.union(enabledOptions, disabledOptions);
      return res;
    },

    /**
     * Overrides the default afterRender method to ask query to validate the
     * user's choices in order to enable the submit button
     * @return {[type]} [description]
     */
    afterRender: function() {
      Backbone.Events.trigger('query:validate');
    }

  });

  return ColumnsView;

});
