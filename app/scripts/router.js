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
      'backbone-super'
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
  'controllers/embed',
  'controllers/default',
  'main'
], function(_, Backbone, fc, EmbedController, DefaultController, Main) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      '(:params)': 'defaultRoute',
      'embed/(:params)': 'embedRoute'
    },

    initialize: function() {
      Backbone.history.start({ pushState: false });
      Backbone.Events.on('route:reset', this.reset, this);
      Backbone.Events.on('route:update', this.update, this);
    },

    /**
     * Verifies and parses the URL params and returns them as an object
     * @return {object} the parsed params: { paramName: paramValue }
     */
    parseParams: function(params) {
      var res = {};
      var unparsedParams = params && params.split('&');
      var validParams    = ['account', 'table', 'graph',
                            'query',   'x',     'y'    ];

      _.each(unparsedParams, function(unparsedParam) {
        var param = unparsedParam.split(':');
        if(validParams.indexOf(param[0]) !== -1 && param.length > 1) {
          res[param[0]] = param[1];
        }
      });

      return res;
    },

    /**
     * Saves the object of params in the facade
     * @param  {Object} params the params: { paramName: paramValue }
     */
    registerParams: function(params) {
      _.each(params, function(value, name) {
        fc.set(name, value);
      });
    },

    /**
     * Loads the embed version of the application
     * @param  {params} params the URL params
     */
    embedRoute: function(params) {
      var parsedParams = this.parseParams(params);
      this.registerParams(parsedParams);
      if(!this.embedController) {
        this.embedController = new EmbedController();
      }
      this.embedController.render();
    },

    /**
     * Loads the traditional version of the application
     * @param  {params} params the URL params
     */
    defaultRoute: function(params) {
      var parsedParams = this.parseParams(params);
      this.registerParams(parsedParams);
      if(!this.defaultController) {
        this.defaultController = new DefaultController();
      }
      this.defaultController.render();
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
      this.navigateTo(params);
    },

    /**
     * Navigates to the URL described by the params
     * @param  {Object} params { param1: value, param2: value, ... }
     */
    navigateTo: function(params) {
      var url = '';
      _.each(params, function(value, key) {
        if(value) {
          url = (url !== '') ? url+'&' : url;
          url += key+':'+value;
        }
      });
      this.navigate(url);
    }

  });

  new Router();

});
