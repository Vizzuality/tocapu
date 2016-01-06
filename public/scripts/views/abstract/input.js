/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'backbone-super',
  'facade',
  'views/abstract/base'
], function(_, Backbone, bSuper, fc, BaseView) {

  'use strict';

  var InputView = BaseView.extend({

    template: '<input value="{{{value}}}" />',

    events: {
      'keyup input': '_update'
    },

    /* Created in the initizalize method so it won't be part of the prototype
       and thus shared with all the instances */
    _model: {},

    /* Used for the validation of the model */
    validate: function() {},

    serialize: function() {
      if(!this._model.validationError) {
        return this._model.toJSON();
      }
      return _.extend(this._model.toJSON(), { error: this._model.validationError });
    },

    initialize: function(settings) {
      this.options = settings && settings.options || {};
      this._model = new (Backbone.Model.extend())();
      this._model.validate = _.bind(this.validate, this);
      this._model.on('change:value', this.render, this);
    },

    get: function(property) {
      return this._model.get(property);
    },

    set: function(object, options) {
      options = _.extend(options || {}, { validate: true });
      this._model.set(object, options);
      return this._model.get(_.keys(object)[0]);
    },

    _update: function(e) {
      fc.unset('autoRender');
      return this.set({ value: e.currentTarget.value }, { silent: true });
    },

    isValid: function() {
      return this._model.isValid();
    },

    beforeDestroy: function() {
      this._model.off();
      this._model = null;
    }

  });

  return InputView;

});
