/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'views/abstract/base'
], function(_, Backbone, BaseView) {

  'use strict';

  var InputView = BaseView.extend({

    template: '<input value="{{{value}}}" />',

    events: {
      'blur': '_update'
    },

    _model: new (Backbone.Model.extend())(),

    /** Used for the validation of the model */
    validate: function() {},

    serialize: function() {
      if(this._model.isValid()) {
        return {
          value: this._model.get('value')
        };
      }
      return {
        value: this._model.get('value'),
        error: this._model.validationError
      };
    },

    initialize: function() {
      this._model.validate = this.validate;
      this._model.on('change', this.render);
    },

    get: function() {
      return this._model.get('value');
    },

    set: function(value) {
      this._model.set({ value: value });
      this.render();
      return this._model.get('value');
    },

    _update: function(e) {
      this.set(e.currentTarget.value);
    }

  });

  return InputView;

});
