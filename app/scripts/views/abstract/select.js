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
      'change': '_update'
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

    setListeners:function() {
      this.collection.on('sync change', _.bind(function() {
        this._model.isValid();
        this.render();
      }, this));
    },

    /* Useful for asynchronous changes */
    setCollection: function(collection) {
      this.collection = collection;
      this.setListeners();
      return collection;
    }

  });

  return SelectView;

});
