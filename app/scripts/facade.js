define([
  'backbone',
  'models/facade'
], function(Backbone, Model) {

  'use strict';

  var model = new Model();

  var Facade = {

    get: function(attribute) {
      if(model.has(attribute)) {
        return model.get(attribute);
      }
      return undefined;
    },

    set: function(attribute, value) {
      model.set(attribute, value);
      Backbone.Events.trigger(attribute+':change');
    }

  };

  return Facade;

});
