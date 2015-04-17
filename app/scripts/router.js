define(['backbone'], function(Backbone) {

  'use strict';

  var Router = Backbone.Router.extend({

    routes: {
      '': 'welcome'
    }

  });

  return Router;

});
