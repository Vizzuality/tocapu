define(function() {

  'use strict';

  return {
    columns: {
      x:       { el: '#xColumn',    label: 'Axis x' },
      y:       { el: '#yColumn',    label: 'Axis y' },
      cat:     { el: '#catColumns', label: 'Column' }
    },

    charts: {
      scatter: {
        name: 'Scatter',
        columns: ['x', 'y'],
        dataType: ['number', 'date']
      },
      pie: {
        name: 'Pie',
        columns: ['cat'],
        dataType: ['string', 'number', 'boolean']
      },
      byCategory: {
        name: 'By Category',
        columns: ['cat'],
        dataType: ['string']
      },
//      timeline: {
//        name: 'Timeline',
//        columns: ['x', 'y'],
//        dataType: ['string', 'number', 'geometry', 'date', 'boolean']
//      }
    },

    dotSizeRange: [2, 20] /* Minimum and maximum dot size on the charts */
  };
});
