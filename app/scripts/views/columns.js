define([
  'backbone',
  'handlebars',
  'facade',
  'helpers/utils',
  'collections/columns',
  'text!templates/columns.handlebars'
], function(Backbone, Handlebars, fc, Utils, ColumnsCollection, tpl) {

  'use strict';

  var ColumnsView = Backbone.View.extend({

    events: {
      'change select': 'setValue'
    },

    template: Handlebars.compile(tpl),

    initialize: function(settings) {
      this.options = settings.options || {};
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
        return (!this.getAttribute('data-type') ||
          dataType.indexOf(this.getAttribute('data-type')) === -1);
      });
    },

    setValue: function(e) {
      /* We save the user's choice*/
      if(e) {
        this.oldValue = this.newValue;
        this.newValue = e.currentTarget.value;
        fc.set(this.options.name, this.newValue);
        Backbone.Events.trigger('route:update');

        /* Used by the query's view so it knows which view was updated */
        this.trigger('change', this);
      }

      /* We restore the state of the column */
      else {
        var savedValue = fc.get(this.options.name);

        /* The value exists and is not disabled */
        if(this.$el.find('option[value='+savedValue+']').length === 1 &&
          !this.$el.find('option[value='+savedValue+']').prop('disabled')) {

          Utils.toggleSelected(this.$el, savedValue);

          this.oldValue = this.newValue;
          this.newValue = savedValue;

          /* Used by the query's view so it knows which view was updated */
          this.trigger('change', this);
        }
        else { /* The saved value is incorrect */
          console.log('wrong saved value for '+this.options.name);
          /* TODO */
        }
      }
    },

    setCollection: function(collection) {
      this.collection = collection;
      this.render();
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
      fc.unset(this.options.name);
      Backbone.Events.trigger('route:update');
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
