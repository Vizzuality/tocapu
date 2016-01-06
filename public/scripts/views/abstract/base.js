/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'backbone-super',
  'handlebars',
  'events'
], function(_, Backbone, bSuper, Handlebars, Events) {

  'use strict';

  var BaseView = Backbone.View.extend({

    template: '',

    /**
     * List of the subviews
     * Ex:
     *   {
     *     myView: new myView()
     *   }
     */
    views: {},

    appEvents: Events,

    /* Adds a view to the list of subviews */
    addView: function(view) {
      var name     = _.keys(view)[0];

      /* Prevents the views object to be the one of the prototype and thus to
         update all the instances with the same value */
      if(this.views === BaseView.prototype.views) {
        this.views = _.clone(BaseView.prototype.views);
      }

      this.views[name] = view[name];
    },

    /* Removes a view from the list of subviews */
    removeView: function(name) {
      /* Prevents the views object to be the one of the prototype and thus to
         update all the instances with the same value */
      if(this.views === BaseView.prototype.views) {
        this.views = _.clone(BaseView.prototype.views);
      }

      if(this.views[name]) {
        delete this.views[name];
      }
    },

    /* Resets the list of subviews */
    resetViews: function() {
      /* Prevents the views object to be the one of the prototype and thus to
         update all the instances with the same value */
      if(this.views === BaseView.prototype.views) {
        this.views = _.clone(BaseView.prototype.views);
      }

      this.views = {};
    },

    /**
     * Data to be passed to the template engine
     * Could be whether an object or a function returning an object
     */
    serialize: {},

    beforeRender: function() {},

    afterRender: function() {},

    render: function() {
      this.beforeRender();

      /* We render the view */
      var template = Handlebars.compile(this.template);
      var serialize = {};

      if(typeof this.serialize === 'object') {
        serialize = this.serialize;
      }
      else {
        serialize = this.serialize();
      }

      this.$el.html(template(serialize));

      /* We render the subviews */
      _.each(this.views, function(view) {
        /* Calls delegateEvents and rebinds the events handlers */
        view.setElement(view.$el.selector).render();
      });

      this.afterRender();
    },

    /**
     * Method to be called when the view is destroyed
     */
    beforeDestroy: function() {},

    /**
     * Destroy the view by removing the el element from the DOM and turning off
     * all the events listeners that have been attached to it
     */
    destroy: function() {
      this.beforeDestroy();
      if(this.views) {
        _.each(this.views, function(view) {
          view.destroy();
        });
        this.resetViews();
      }
      this.remove();
      this.appEvents.off(null, null, this);
    }

  });

  return BaseView;

});
