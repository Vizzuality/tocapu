require.config({

  baseUrl: 'scripts',

  paths: {
    tocapu: 'lib/tocapu/index',
    ejs: '../../bower_components/ejs/ejs',
    d3: '../../bower_components/d3/d3',
    text: '../../bower_components/text/text'
  },

  shim: {
    tocapu: {
      exports: 'Tocapu'
    },
    d3: {
      exports: 'd3'
    }
  }

});

require([
  'tocapu',
  'd3',
  'views/account'
], function(Tocapu, d3, AccountView) {

  'use strict';

  var App = Tocapu.Class.extend({

    el: d3.select('body'),

    Views: {
      Account: AccountView
    },

    init: function() {
      this.content = d3.select('#main');
      this.current = new this.Views.Account({
        el: d3.select('div').attr('id', 'accountView')
      });
      this.render();
    },

    render: function() {
      this.content.html( this.current.render().el.html() );
    }

  });

  new App();

});
