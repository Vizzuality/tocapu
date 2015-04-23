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

    /**
     * Disables an input's option
     * @param  {String} value the value of the option to disable
     */
    disableOption: function(value) {
      this.$el.find('option[value='+value+']').prop('disabled', true);
    },

    /**
     * Enables an input's option
     * @param  {String} value the value of the option to enable
     */
    enableOption: function(value) {
      this.$el.find('option[value='+value+']').prop('disabled', false);
    },

    /**
     * Disables the input's options if not present in the accepted data types
     * @param  {String} dataType the list of the accepted data types
     */
    updateOptions: function(dataType) {
      this.$el.find('option').prop('disabled', function() {
        return (!this.getAttribute('data-type') ||
          dataType.indexOf(this.getAttribute('data-type')) === -1);
      });
    },

    /**
     * Sets the default option of the input or restores it
     * @param {Object} e optional the event's object from the user's click
     */
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

    /**
     * Sets a new collection to the view
     * @param {Object} collection Backbone.Collection
     */
    setCollection: function(collection) {
      this.collection = collection;
      this.render();
    },

    /**
     * Renders the input
     */
    render: function() {
      this.$el.html(this.template({
        name:    this.options.name,
        label:   this.options.label,
        columns: this.collection.toJSON()
      }));
      return this;
    },

    /**
     * Resets the input state and triggers a route:change event
     */
    reset: function() {
      this.oldValue = undefined;
      this.newValue = '---';
      this.$el.children().remove();
      fc.unset(this.options.name);
      Backbone.Events.trigger('route:update');
    },

    /**
     * Returns the current selected option value
     */
    getValue: function() {
      return this.newValue;
    },

    /**
     * Returns the previous selected input value
     * @return {String} the value
     */
    getPreviousValue: function() {
      return this.oldValue;
    }

  });

  return ColumnsView;

});
