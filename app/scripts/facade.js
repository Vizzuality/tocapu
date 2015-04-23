define([
  'backbone',
  'models/facade'
], function(Backbone, Model) {

  'use strict';

  var model = new Model();

  var Facade = {

    /**
     * Retrieves an object or variable from the model
     * @param  {String} attribute the element's name
     * @return {*}                the value of the element or undefined if it
     *                            doesn't exist
     */
    get: function(attribute) {
      if(model.has(attribute)) {
        return model.get(attribute);
      }
      return undefined;
    },

    /**
     * Stores an object or variable in the model
     * @param {String} attribute the element's name
     * @param {*}      value     the object or variable to be associated
     */
    set: function(attribute, value) {
      model.set(attribute, value);
    },

    /**
     * Unsets an element from the model
     * @param  {String} attribute the element's name
     */
    unset: function(attribute) {
      if(model.has(attribute)) {
        model.unset(attribute);
      }
    },

    /**
     * Resets the model
     */
    reset: function() {
      model = new Model();
    }

  };

  return Facade;

});
