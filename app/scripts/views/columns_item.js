define([
  'backbone',
  'underscore',
  'handlebars',
  'facade',
  'config',
  'helpers/utils',
  'collections/columns',
  'text!templates/columns.handlebars'
], function(Backbone, _, Handlebars, fc, Config, Utils, ColumnsCollection,
  tpl) {

  'use strict';

  var ColumnsView = Backbone.View.extend({

    events: {
      'change select': 'setValue'
    },

    template: Handlebars.compile(tpl),

    initialize: function(settings) {
      this.options = settings.options || {};
      this.currentOption = undefined;
      this.hasRestoredValue = false;
      this.hasError = false;
      Backbone.Events.on('columns:update', this.render, this);
    },

    /**
     * Returns the current selected option value
     */
    getValue: function() {
      return this.currentOption;
    },

    /**
     * Sets the default option of the input or restores it
     * @param {Object} e optional the event's object from the user's click
     */
    setValue: function(e) {
      var data = this.collection.models;

      /* We restore the saved options */
      if(!e && fc.get(this.options.name)) {
        var option;
        /* We try to find the option from the data
           Note: better use a for than an forEach here */
        var found = false;
        for(var i = 0; i < data.length; i++) {
          if(data[i].attributes.name === fc.get(this.options.name)) {
            option = data[i].attributes;
            found = true;
            break;
          }
        }

        /* The column's name couln't be find */
        if(!found) {
          this.hasError = true;
          this.errorMessage = 'Unable to retrieve the selected column';
          this.render();
          fc.unset(this.options.name);
          Backbone.Events.trigger('route:update');
          return;
        }

        /* The option isn't compatible with the graph's type */
        if(Config.charts[fc.get('graph')].dataType.indexOf(option.type) ===
            -1) {
          this.hasError = true;
          this.errorMessage = 'The column\'s type is not compatible with the ';
          this.errorMessage += 'graph\'s type';
          this.render();
          fc.unset(this.options.name);
          Backbone.Events.trigger('route:update');
          return;
        }

        /* The option is already taken by another column */
        if(option.disabled && option.name !== this.currentOption) {
          this.hasError = true;
          this.errorMessage = 'The column is already in use';
          this.render();
          fc.unset(this.options.name);
          Backbone.Events.trigger('route:update');
          return;
        }
      }

      /* In case the restored option didn't throw an error or this function is
         called by a user's action, we execute the following instructions */

      /* Better use a for than an forEach here as we're just searching for
         two values */
      var previousOptionUpdated = false,
          newOptionUpdated      = false;
      for(var i = 0; i < data.length; i++) {
        /* We re-enable our previous option */
        if(this.currentOption &&
          data[i].attributes.name === this.currentOption) {
          data[i].attributes.disabled = false;
          previousOptionUpdated = true;
        }
        /* We disable the new option */
        if(e && data[i].attributes.name === e.currentTarget.value ||
          !e && fc.get(this.options.name) &&
          data[i].attributes.name === fc.get(this.options.name)) {
          data[i].attributes.disabled = true;
          newOptionUpdated = true;
        }
        /* We try to minimize the number of loops */
        if(previousOptionUpdated && newOptionUpdated) { break; }
      }

      /* We save the new option */
      this.currentOption =  e ? e.currentTarget.value :
        fc.get(this.options.name);
      fc.set(this.options.name, this.currentOption);

      /* We delete the possible previous errors */
      this.hasError = false;
      this.errorMessage = undefined;
      this.hasRestoredValue = e ? false : true;

      /* We save the option inside the URL */
      Backbone.Events.trigger('route:update');

      /* We ask the other columns to update
         We don't need to render here as we're calling ourselves with this
         event */
      Backbone.Events.trigger('columns:update');
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
      var params = {
        name:          this.options.name,
        label:         this.options.label,
        currentOption: this.currentOption,
        columns:       this.collection.toJSON(),
        hasError:      this.hasError,
        error:         this.errorMessage,
        acceptedData:  Config.charts[fc.get('graph')].dataType
      };

      this.$el.html(this.template(params));
      Backbone.Events.trigger('query:validate');

      return this;
    }

  });

  return ColumnsView;

});
