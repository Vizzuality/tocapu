/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'views/abstract/input'
], function(_, Backbone, InputView) {

  'use strict';

  var SelectView = InputView.extend({

    template: '<select>' +
              '{{#each options}}' +
              '<option>{{{value}}}</option>' +
              '{{/each}}' +
              '</select>',

    /* Stores the options */
    collection: new (Backbone.Collection.extend({}))(),

    /* Override */
    serialize: function() {
      if(this.model.isValid()) {
        return {
          options: _.pick(this.model.get('collection').toJSON(), 'options'),
          value: this.model.get('value')
        };
      }
      return {
        options: _.pick(this.model.get('collection').toJSON(), 'options'),
        value: this.model.get('value'),
        error: this.model.validationError
      };
    },

    /* Override */
    initialize: function() {
      this.model.set({ collection: this.collection });
      this.model.validate = this.validate;
      this.model.on('change', this.render);
      this.collection.on('change', this.setCollection);
    },

    /* Useful for asynchronous changes */
    setCollection: function(collection) {
      this.model.set({ collection: collection });
      return this.model.get('collection');
    }

  });

  return SelectView;

});
