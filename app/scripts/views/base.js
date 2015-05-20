/*jshint bitwise:false*/
define([
  'underscore',
  'backbone',
  'handlebars',
], function(_, Backbone, Handlebars) {

  'use strict';

  var BaseView = Backbone.View.extend({

    template: '',

    /**
     * List of the subviews
     * Ex:
     *   {
     *     '.css-selector': new myView()
     *   }
     */
    views: {},

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
      _.each(this.views, function(view, el) {
        /* Calls delegateEvents and rebinds the events handlers */
        view.setElement(el).render();
      });

      this.afterRender();
    }

  });

  return BaseView;

});
