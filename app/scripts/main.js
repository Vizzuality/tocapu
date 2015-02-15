require.config({

  baseUrl: 'scripts',

  paths: {
    tocapu: 'lib/tocapu/index',
    d3: '../../bower_components/d3/d3',
    text: '../../bower_components/text/text'
  },

  shim: {
    tocapu: {
      exports: 'Tocapu'
    },
    d3: {
      exports: 'd3'
    },
  }

});

require([
  'd3',
  'tocapu',
  'views/account'
], function(d3, Tocapu, AccountView) {

  'use strict';

  var App = Tocapu.Class.extend({

    el: d3.select('body'),

    Views: {
      Account: AccountView
    },

    init: function() {
      this.content = d3.select('#main');
      this.current = new this.Views.Account({
        el: this.content
      });
      this.render();
    },

    render: function() {
      this.content.html( this.current.render().el.html() );
      this.current.setListeners();
    }

  });

  new App();

});
