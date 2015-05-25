/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'backbone-super',
  'views/abstract/input'
], function(_, Backbone, bSuper, InputView) {

  'use strict';

  var SelectView = InputView.extend({

    template: '<select>' +
              '{{#each options}}' +
              '<option>{{{value}}}</option>' +
              '{{/each}}' +
              '</select>',

    events: {
      'change': '_pickOption'
    },

    /* Stores the options */
    collection: new (Backbone.Collection.extend({}))(),

    serialize: function() {
      var res = this._super();
      return _.extend(res, { options: this.collection.toJSON() });
    },

    initialize: function(settings) {
      this._super(settings);
      this.setListeners();
    },

    validate: function() {
      var value = this.getValue();
      var option = this._getOption(value);
      if(value !== undefined) {
        if(!option) {
          return 'Unable to retrieve the selected option';
        }
        else if(option.disable) {
          return 'This option can\'t be chosen';
        }
      }
    },

    setListeners:function() {
      this.collection.on('sync change', _.bind(function() {
        this.restoreValue();
        this.render();
      }, this));
    },

    /* Useful for asynchronous changes */
    setCollection: function(collection) {
      this.collection = collection;
      this.setListeners();
      this.collection.trigger('sync');
      return collection;
    },

    /**
     * Returns the current selected option value
     * @return {Object} the model associated to the option
     */
    getValue: function() {
      return this.get('value');
    },

    /**
     * Sets the selected option
     */
    setValue: function(value) {
      this._toggleDisable(this.getValue());
      var returnedValue = this.set({ value: value });
      this._toggleDisable(this.getValue());
      return returnedValue;
    },

    /**
     * Sets the value to the current one
     * Useful when changing the collection
     */
    restoreValue: function() {
      var value = this.getValue();
      this._toggleDisable(this.getValue(), true);
    },

    /**
     * Returns the data associated to an option
     * @param  {String}               name the option's name/value
     * @return {undefined||Object}    the option's data if found, undefined
     *                                otherwise
     */
    _getOption: function(name) {
      var res = this.collection.where({ name: name });
      return res.length > 0 ? res[0].attributes : undefined;
    },

    /**
     * Toggles the disable attribute of an option
     * @param  {String}  optionName the option value
     * @param  {Boolean} value force the 'disabled' attribute to this arg
     */
    _toggleDisable: function(optionName, value) {
      var option = this._getOption(optionName);
      if(option) {
        option.disabled = value || !option.disabled;
      }
    },

    _pickOption: function(e) {
      this._toggleDisable(this.getValue());
      var value = this._update(e); /* Inherited from the input view */
      this._toggleDisable(value);
      return value;
    }

  });

  return SelectView;

});
