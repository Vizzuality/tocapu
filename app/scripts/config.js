define(function() {

  'use strict';

  return {
    columns: {
      x:       { el: '#xColumn', label: 'Axis x' },
      y:       { el: '#yColumn', label: 'Axis y' }
    },

    charts: {
      scatter: {
        columns: ['x', 'y'],
        dataType: ['number']
      },
      pie: {
        columns: ['x', 'y'],
        dataType: ['string', 'number', 'geometry', 'date', 'boolean']
      },
      byCategory: {
        columns: ['x', 'y'],
        dataType: ['string', 'number', 'geometry', 'date', 'boolean']
      },
      timeline: {
        columns: ['x', 'y'],
        dataType: ['string', 'number', 'geometry', 'date', 'boolean']
      }
    },

    dotSizeRange: [2, 20] /* Minimum and maximum dot size on the charts */
  };
});
