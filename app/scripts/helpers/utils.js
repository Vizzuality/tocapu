define(['handlebars'], function(Handlebars) {

  'use strict';

  /**
   * Registers helpers to Handlebars
   */
  Handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('inArray', function(v1, v2, options) {
    if(v2.indexOf(v1) !== -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  var Utils = {

    /**
     * Extracts and returns the data from a collection
     * @param  {Object} collection Backbone.Collection
     * @return {Object}            the data
     */
    extractData: function(collection) {
      return (collection.toJSON().length > 0) ? collection.toJSON()[0] : {};
    },

    /**
     * Toggles the selected attribute to an option element
     * @param  {Object} $input    the jQuery object input
     * @param  {String} option    the valuf of the option to be selected
     */
    toggleSelected: function($input, option) {
      $input.find('option:selected').removeAttr('selected');
      $input.find('option[value='+option+']').prop('selected', true);
    },

    /**
     * Returns the cartoDb end point with the username included
     * @param  {String} username
     * @return {String}          the URL end point
     */
    getEndPoint: function(username) {
      return 'http://'+username+'.cartodb.com/api/v2/sql';
    },

    /**
     * Returns the cartoDb end point with the username and query set
     * @param  {String} username
     * @param  {String} query    the SQL query to be executed by CartoDB
     * @return {String}          the URL end point
     */
    formatEndPoint: function(username, query) {
      return this.getEndPoint(username)+'?q='+query;
    },

    /**
     * Transforms a Date object to a string with the format YYYY-MM-DD HH:mm:ss
     * @param  {Date}   date
     * @return {String} the formatted string
     */
    dateToString: function(date) {
      var y = this.padding(date.getFullYear(), 4, '0'),
          m = this.padding(date.getMonth() + 1, 2, '0'),
          d = this.padding(date.getDate(), 2, '0'),
          h = this.padding(date.getHours(), 2, '0'),
          mn = this.padding(date.getMinutes(), 2, '0'),
          s = this.padding(date.getSeconds(), 2, '0');
      return y+'-'+m+'-'+d+' '+h+':'+mn+':'+s;
    },

    /**
     * Adds a n-character padding at the beginning of a string with the char arg
     * @param  {String/Number} val  the string to pad
     * @param  {Number}        nb   the number of characters to reach
     * @param  {String}        char the character used to pad
     * @return {String}        the padded string
     */
    padding: function(val, n, char) {
      val = typeof val === 'number' ? val.toString() : val;
      var diff = n - val.length;
      var res = val;
      if(diff > 0) {
        for(var i = diff; i > 0; i --) {
          res = char+res;
        }
      }
      return res;
    }

  };

  return Utils;

});
