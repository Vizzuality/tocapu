require.config({

  baseUrl: 'scripts',

  paths: {
    jquery: '../../bower_components/jquery/dist/jquery',
    underscore: '../../bower_components/underscore/underscore',
    backbone: '../../bower_components/backbone/backbone',
    handlebars: '../../bower_components/handlebars/handlebars',
    d3: '../../bower_components/d3/d3',
    c3: '../../bower_components/c3/c3',
    text: '../../bower_components/text/text',
    moment: '../../bower_components/moment/moment',
    uri: '../../bower_components/uri.js/src',
    'backbone-super': '../../bower_components/backbone-super/backbone-super/' +
      'backbone-super-min'
  },

  shim: {
    'd3': {
      exports: 'd3'
    }
  }

});

require([
  'underscore',
  'backbone',
  'facade',
  'main'
], function(_, Backbone, fc, Main) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      '(:params)': 'parseUrl',
      'embed/(:params)': 'loadEmbed'
    },

    initialize: function() {
      Backbone.history.start({ pushState: false });
      Backbone.Events.on('route:reset', this.reset, this);
      Backbone.Events.on('route:update', this.update, this);
    },

    /**
     * Parses the URL params and triggers a route:change event
     * @param  {String}  url the unparsed url part containing the params
     * @param  {Boolean} isEmbed is an embedded view if true
     */
    parseUrl: function(url, isEmbed) {
      fc.set('isEmbed', isEmbed || undefined);

      /* If no parameter has been given, we just load the default template */
      if(!url) {
        this.main = (!this.main) ? new Main() : this.main;
        Backbone.Events.trigger('route:change');
        return;
      }

      /* Otherwise, if params have been given, we parse and save them */
      var unparsedParams = url.split('&'),
          validParams    = ['account', 'table', 'graph',
                            'query',   'x',     'y'    ];

      _.each(unparsedParams, function(unparsedParam) {
        var param = unparsedParam.split(':');
        if(validParams.indexOf(param[0]) !== -1 && param.length > 1) {
          fc.set(param[0], param[1]);
        }
      });

      /* We instantiate main if it doesn't exist */
      this.main = (!this.main) ? new Main() : this.main;
      Backbone.Events.trigger('route:change');
    },

    loadEmbed: function(url) {
      this.parseUrl(url, true);
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
        this.navigateTo(params.table ? params : _.pick(params, 'account'));
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

  new Router();

});
