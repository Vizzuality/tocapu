define([
  'backbone',
  'handlebars',
  'facade',
  'collections/columns',
  'text!templates/columns.handlebars'
], function(Backbone, Handlebars, Facade, ColumnsCollection, tpl) {

  'use strict';

  var ColumnsView = Backbone.View.extend({

    events: {
      'change select': 'saveValue'
    },

    template: Handlebars.compile(tpl),

    initialize: function(settings) {
      this.options = settings.options || {};
      this.collection = Facade.get('columnsData');
      this.oldValue = undefined;
      this.newValue = '---';
    },

    disableOption: function(value) {
      this.$el.find('option[value='+value+']').prop('disabled', true);
    },

    enableOption: function(value) {
      this.$el.find('option[value='+value+']').prop('disabled', false);
    },

    updateOptions: function(dataType) {
      this.$el.find('option').prop('disabled', function() {
        return (!this.getAttribute('data-type') || dataType.indexOf(this.getAttribute('data-type')) === -1);
      });
    },

    saveValue: function(e) {
      this.oldValue = this.newValue;
      this.newValue = e.currentTarget.value;
      this.trigger('change', this); /* Used by queryView so it knows which view was updated */
    },

    render: function() {
      this.$el.html(this.template({
        name:    this.options.name,
        label:   this.options.label,
        columns: this.collection.toJSON()
      }));
      return this;
    },

    reset: function() {
      this.oldValue = undefined;
      this.newValue = '---';
      this.$el.children().remove();
    },

    getValue: function() {
      return this.newValue;
    },

    getPreviousValue: function() {
      return this.oldValue;
    }

  });

  return ColumnsView;

});
