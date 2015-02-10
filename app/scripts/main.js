require.config({

  baseUrl: 'scripts',

  paths: {
    classjs: '../../lib/class',
    d3: '../../bower_components/d3/d3'
  },

  shim: {
    classjs: {
      exports: 'Class'
    },
    d3: {
      exports: 'd3'
    }
  }

});

require([
  'classjs',
  'd3',
  'views/account'
], function(Class, d3, AccountView) {

  'use strict';

  var App = Class.extend({

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
