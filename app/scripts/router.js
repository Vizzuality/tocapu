define([
  'underscore',
  'backbone',
  'facade'
], function(_, Backbone, fc) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      '': 'index',
      ':params': 'parseUrl',
      'embed/:params': 'loadEmbed'
    },

    initialize: function() {
      Backbone.Events.on('route:reset', this.reset, this);
      Backbone.Events.on('route:update', this.update, this);
    },

    index: function() {
      /* TODO */
    },

    /**
     * Parses the URL params and triggers a route:change event
     * @param  {String} url the unparsed url part containing the params
     */
    parseUrl: function(url) {
      var unparsedParams = url.split('&'),
          validParams    = ['account', 'table', 'graph',
                            'query',   'x',     'y'    ];

      /* We parse the params */
      _.each(unparsedParams, function(unparsedParam) {
        var param = unparsedParam.split(':');
        if(validParams.indexOf(param[0]) !== -1 && param.length > 1) {
          fc.set(param[0], param[1]);
        }
      });

      Backbone.Events.trigger('route:change');
    },

    loadEmbed: function() {
      /* TODO */
      console.log('embed');
    },

    /**
     * Resets the route to the top level domain
     */
    reset: function() {
      this.navigate('');
    },

    /**
     * Updates the URL according to the params saved in the facade
     */
    update: function() {
      var params = {
        account: fc.get('account'),
        table:   fc.get('table'),
        graph:   fc.get('graph'),
        x:       fc.get('x'),
        y:       fc.get('y')
      };

      if(params.account) {
        if(params.table) {
          this.navigateTo(params);
        }
        else {
          this.navigateTo(_.pick(params, 'account'));
        }
      }
      else {
        this.navigateTo({});
      }
    },

    /**
     * Navigates to the URL described by the params
     * @param  {Object} params { param1: value, param2: value, ... }
     */
    navigateTo: function(params) {
      var url = '';
      _.each(params, function(value, key) {
        if(value) {
          if (url !== '') { url += '&'; }
          url += key+':'+value;
        }
      });
      this.navigate(url);
    }

  });

  return Router;

});
