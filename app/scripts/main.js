require.config({

  baseUrl: 'scripts',

  paths: {
    jquery: '../../bower_components/jbone/dist/jbone',
    underscore: '../../bower_components/underscore/underscore',
    backbone: '../../bower_components/exoskeleton/exoskeleton',
    handlebars: '../../bower_components/handlebars/handlebars',
    d3: '../../bower_components/d3/d3',
    text: '../../bower_components/text/text'
  },

  shim: {
  }

});

require([
  'backbone',
  'lib/quipu',
  'router',
  'views/account'
], function(Backbone, quipu, Router, AccountView) {

  'use strict';

  var Tocapu = Backbone.View.extend({

    el: 'body',

    initialize: function() {
      this.router = new Router();
      this.account = new AccountView({ el: '#accountView' });
      this.setListeners();
    },

    setListeners: function() {
      this.listenTo(this.account.model, 'change', this.showTables);
    },

    showTables: function() {
      console.log(this.account.model.attributes);
    },

    start: function() {
      Backbone.history.start({ pushState: false });
    }

  });

  new Tocapu().start();

});
