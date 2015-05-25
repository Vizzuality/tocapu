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
      'change select': '_pickOption'
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
     * Sets a specific value/option to the select input, asks the other columns
     * to update
     * @return {String} value if the option could be found, the previous one
     *                        otherwise
     */
    setValue: function(value) {
      var returnedValue = this._super(value);
      fc.set(this.options.name, returnedValue);
      Backbone.Events.trigger('route:update');
      Backbone.Events.trigger('columns:update');
      return returnedValue;
    },

    /**
     * Verifies that the chosen value is correct
     * @return {String} returns the error message if so
     */
    validate: function() {
      this._super();
      var acceptedDataTypes = this._getAcceptedDataTypes();
      if(this.getValue()) {
        var option = this._getOption(this.getValue());
        if(acceptedDataTypes.indexOf(option.type) === -1) {
          return 'This option isn\'t compatible with the type of chart';
        }
      }
    },

    /**
     * Sets the default option of the input or restores it
     * @param {Object} e optional the event's object from the user's click
     */
    _pickOption: function(e) {
      var value = this._super(e);
      this.hasRestoredValue = false;
      fc.set(this.options.name, value);
      Backbone.Events.trigger('route:update');
      Backbone.Events.trigger('columns:update');
    },

    /**
     * Filters the options according to their data types and their availability
     * Note that the current selected option won't be returned as it owns the
     * attribute 'disabled'
     * @param  {Array} options the list of options
     * @return {Array}         the enabled options
     */
    _getEnabledOptions: function(options) {
      var acceptedDataTypes = this._getAcceptedDataTypes();
      return options.filter(function(option) {
        return acceptedDataTypes.indexOf(option.type) !== -1 &&
          !option.disabled;
      }, this);
    },

    /**
     * Returns the disabled options according to their data types and
     * availability
     * Note that it will return the current selected option
     * (see _getEnabledOptions)
     * @param  {Array} options the list of options
     * @return {Array}         the disabled options
     */
    _getDisabledOptions: function(options) {
      return _.difference(options, this._getEnabledOptions(options));
    },

    /**
     * Returns the accepted data types for the column's options
     * @return {Array} the array of accepted data types (strings)
     */
    _getAcceptedDataTypes: function() {
      return Config.charts[fc.get('graph')].dataType;
    },

    /**
     * Overrides the default serialize method to filter the options according to
     * their data types and their availability
     * @return {Object} the data the template engine needs to render the column
     */
    serialize: function() {
      var res = this._super();
      var options = _.clone(res.options);
      var disabledOptions = this._getDisabledOptions(options);
      var currentOptionName = this.getValue();
      var acceptedDataTypes = this._getAcceptedDataTypes();

      _.each(options, function(option) {
        if(option.name === currentOptionName
          && acceptedDataTypes.indexOf(option.type) !== -1) {
          delete option.disabled;
        }
        else if(disabledOptions.indexOf(option) !== -1) {
          /* We add the disabled attribute at the template level, that's
             different from the disabled attribute at the model level even if it
             could already be set if the option has been disabled because it has
             already been chosen */
          option.disabled = true;
        }
      });

      res.options = options;
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
