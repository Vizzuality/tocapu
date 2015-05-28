define(function() {

  'use strict';

  return {
    columns: {
      x:       { el: '#xColumn', label: 'Axis x' },
      y:       { el: '#yColumn', label: 'Axis y' }
    },

    charts: {
      scatter: {
        name: 'Scatter',
        columns: ['x', 'y'],
        dataType: ['number']
      },
      pie: {
        name: 'Pie',
        columns: ['x', 'y'],
        dataType: ['string', 'number', 'geometry', 'date', 'boolean']
      },
      byCategory: {
        name: 'By Category',
        columns: ['x', 'y'],
        dataType: ['string', 'number', 'geometry', 'date', 'boolean']
      },
      timeline: {
        name: 'Timeline',
        columns: ['x', 'y'],
        dataType: ['string', 'number', 'geometry', 'date', 'boolean']
      }
    },

    dotSizeRange: [2, 20] /* Minimum and maximum dot size on the charts */
  };
});
