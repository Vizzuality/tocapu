define([
  'backbone',
  'handlebars',
  'collections/columns',
  'text!templates/columns.handlebars'
], function(Backbone, Handlebars, ColumnsCollection, tpl) {

  'use strict';

  var ColumnsView = Backbone.View.extend({

    events: {
      'change select': 'updateColumn'
    },

    template: Handlebars.compile(tpl),

    initialize: function(settings) {
      this.options = settings.options || {};
      if (!this.collection) {
        this.collection = new ColumnsCollection();
      }
    },

    updateColumn: function() {
      this.trigger('column:change', { value: this.getValue() });
    },

    render: function() {
      this.$el.html(this.template({
        axis: this.options.axis,
        columns: this.collection.toJSON()
      }));
      return this;
    },

    isNumericalOption: function(option) {
      var regex = /\(number\)$/;
      return regex.test(option);
    },

    isNumerical: function() {
      var option = this.$el.find('option:selected').text();
      return this.isNumericalOption(option);
    },

    getValue: function() {
      return this.$el.find('select').val();
    },

    resetDisabledValues: function() {
      this.$el.find('option').prop('disabled', false);
    },

    disableValue: function(value) {
      this.$el.find('option[value="'+value+'"]').prop('disabled', true);
    },

    disableNonNumericalValues: function() {
      this.$el.find('option').prop('disabled', _.bind(function(i) {
        var option = this.$el.find('option').get(i).text;
        if(!this.isNumericalOption(option)) {
          return true;
        }
      }, this));
    }

  });

  return ColumnsView;

});
