define(function() {

  'use strict';

  var Utils = {

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
    }

  };

  return Utils;

});
