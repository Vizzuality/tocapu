require.config({

  baseUrl: '../scripts',

  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    underscore: '../bower_components/underscore/underscore',
    backbone: '../bower_components/backbone/backbone',
    handlebars: '../bower_components/handlebars/handlebars',
    d3: '../bower_components/d3/d3',
    c3: '../bower_components/c3/c3',
    text: '../bower_components/text/text',
    moment: '../bower_components/moment/moment',
    uri: '../bower_components/uri.js/src',

    mocha: '../bower_components/mocha/mocha',
    sinon: '../bower_components/sinon/lib/sinon',

    specs: '../test/specs'
  },

  shim: {
    'd3': {
      exports: 'd3'
    },
    'mocha': {
      exports: 'mocha'
    }
  }

});

require([
  'mocha'
],function(mocha) {

  'use strict';

  mocha.ui('bdd');

  require([
    'specs/views/datatable'
  ], function() {

    if(window.mochaPhantomJS) {
      mochaPhantomJS.run();
    }
    else {
      mocha.run();
    }

  });

});
